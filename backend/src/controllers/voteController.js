const { db, admin } = require('../config/firebase');

/**
 * Cast a Vote for an Idea
 * Logic: 
 * 1. User must be verified
 * 2. User can only vote once per competition
 */
const castVote = async (req, res) => {
  const { ideaId, competitionId } = req.body;
  const userId = req.user.uid;

  if (!ideaId || !competitionId) {
    return res.status(400).json({ status: 'error', message: 'ideaId and competitionId are required' });
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'User profile not found.' });
    }

    if (userData.kyc_status !== 'verified') {
      return res.status(403).json({ status: 'error', message: 'You must be KYC verified to vote.' });
    }

    if (userData.voter_payment_status !== 'paid' && userData.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You must pay the voter entry fee to vote.' });
    }

    // 2. Perform a strict Firestore Transaction to ensure data integrity
    await db.runTransaction(async (transaction) => {
      // a. Check Idea
      const ideaRef = db.collection('ideas').doc(ideaId);
      const ideaDoc = await transaction.get(ideaRef);

      if (!ideaDoc.exists) {
        throw new Error('Idea not found.');
      }

      const ideaData = ideaDoc.data();

      if (ideaData.payment_status !== 'paid') {
        throw new Error('This idea is not eligible for voting yet.');
      }

      if (ideaData.user_id === userId) {
        throw new Error('You cannot vote for your own idea.');
      }

      // b. Check if user already voted in this competition
      const voteQuery = db.collection('votes')
        .where('userId', '==', userId)
        .where('competitionId', '==', competitionId);
      
      const voteCheck = await transaction.get(voteQuery);
      if (!voteCheck.empty) {
        throw new Error('You have already voted in this competition.');
      }

      // c. Record the vote and increment atomically
      const newVoteRef = db.collection('votes').doc();
      transaction.set(newVoteRef, {
        userId,
        ideaId,
        competitionId,
        timestamp: new Date().toISOString()
      });

      transaction.update(ideaRef, {
        votes_count: admin.firestore.FieldValue.increment(1)
      });
    });

    res.json({
      status: 'success',
      message: 'Vote cast successfully via secure transaction!'
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    // Determine if it's our thrown validation error or a system error
    if (error.message && !error.message.includes('No document to update')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error while voting.' });
  }
};

module.exports = {
  castVote
};

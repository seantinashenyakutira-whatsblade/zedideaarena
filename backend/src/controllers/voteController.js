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
    // 1. Check if user is verified and has paid the voter fee
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userDoc.exists || !userData.is_verified) {
      return res.status(403).json({ status: 'error', message: 'You must be KYC verified to vote.' });
    }

    if (userData.voter_payment_status !== 'paid' && userData.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You must pay the voter entry fee to vote.' });
    }

    // 2. Check if user has already voted in this competition
    const voteCheck = await db.collection('votes')
      .where('userId', '==', userId)
      .where('competitionId', '==', competitionId)
      .get();

    if (!voteCheck.empty) {
      return res.status(400).json({ status: 'error', message: 'You have already voted in this competition.' });
    }

    // 3. Record the vote
    const voteRef = db.collection('votes').doc();
    await voteRef.set({
      userId,
      ideaId,
      competitionId,
      timestamp: new Date().toISOString()
    });

    // 4. Increment vote count on the idea
    await db.collection('ideas').doc(ideaId).update({
      votes_count: admin.firestore.FieldValue.increment(1)
    });

    res.json({
      status: 'success',
      message: 'Vote cast successfully!'
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error while voting.' });
  }
};

module.exports = {
  castVote
};

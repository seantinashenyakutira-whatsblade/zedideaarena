const { supabase } = require('../config/supabase');

const castVote = async (req, res) => {
  const { ideaId, competitionId } = req.body;
  const userId = req.user.uid;

  if (!ideaId || !competitionId) {
    return res.status(400).json({ status: 'error', message: 'ideaId and competitionId are required' });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_verified, voter_payment_status, role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ status: 'error', message: 'User profile not found.' });
    }

    if (!userData.is_verified) {
      return res.status(403).json({ status: 'error', message: 'You must be verified by an admin to vote.' });
    }

    if (userData.voter_payment_status !== 'paid' && userData.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You must pay the voter entry fee to vote.' });
    }

    const { data: ideaData, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !ideaData) {
      return res.status(404).json({ status: 'error', message: 'Idea not found.' });
    }

    if (ideaData.payment_status !== 'paid') {
      return res.status(403).json({ status: 'error', message: 'This idea is not eligible for voting yet.' });
    }

    if (ideaData.user_id === userId) {
      return res.status(403).json({ status: 'error', message: 'You cannot vote for your own idea.' });
    }

    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .single();

    if (existingVote) {
      return res.status(400).json({ status: 'error', message: 'You have already voted in this competition.' });
    }

    const { error: voteError } = await supabase.from('votes').insert({
      user_id: userId,
      idea_id: ideaId,
      competition_id: competitionId,
    });

    if (voteError) throw voteError;

    const { error: countError } = await supabase
      .from('ideas')
      .update({ votes_count: ideaData.votes_count + 1 })
      .eq('id', ideaId);

    if (countError) throw countError;

    res.json({ status: 'success', message: 'Vote cast successfully!' });
  } catch (error) {
    console.error('Error casting vote:', error);
    if (error.message && (error.message.includes('already voted') || error.message.includes('cannot vote') || error.message.includes('must be') || error.message.includes('must pay') || error.message.includes('not eligible') || error.message.includes('not found'))) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error while voting.' });
  }
};

const getUserVotes = async (req, res) => {
  const userId = req.user.uid;

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('idea_id, competition_id')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch votes' });
  }
};

module.exports = { castVote, getUserVotes };

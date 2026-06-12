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
      .select('idea_id, competition_id, innovation_rating, impact_rating, feasibility_rating, comment, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch votes' });
  }
};

const castVoteV2 = async (req, res) => {
  const { idea_id, competition_id, innovation_rating, impact_rating, feasibility_rating, comment } = req.body;
  const userId = req.user.uid;

  if (!idea_id || !competition_id) {
    return res.status(400).json({ status: 'error', message: 'idea_id and competition_id are required' });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_verified, voter_competitions_paid')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ status: 'error', message: 'User profile not found.' });
    }

    if (!userData.is_verified) {
      return res.status(403).json({ status: 'error', message: 'You must be verified by an admin to vote.' });
    }

    const paidComps = userData.voter_competitions_paid || [];
    if (!paidComps.includes(competition_id)) {
      return res.status(403).json({ status: 'error', message: 'You must pay the voter fee for this competition to vote.' });
    }

    const { data: compData, error: compError } = await supabase
      .from('competitions')
      .select('submission_deadline, end_date')
      .eq('id', competition_id)
      .single();

    if (compError || !compData) {
      return res.status(404).json({ status: 'error', message: 'Competition not found.' });
    }

    const now = new Date();
    const deadline = new Date(compData.submission_deadline || compData.end_date);
    if (now > deadline) {
      return res.status(403).json({ status: 'error', message: 'This competition is closed and no longer accepting votes.' });
    }

    const { data: ideaData, error: ideaError } = await supabase
      .from('ideas')
      .select('id, user_id, status, is_public, votes_count')
      .eq('id', idea_id)
      .single();

    if (ideaError || !ideaData) {
      return res.status(404).json({ status: 'error', message: 'Idea not found.' });
    }

    if (ideaData.status !== 'approved') {
      return res.status(403).json({ status: 'error', message: 'This idea is not approved for voting.' });
    }

    if (!ideaData.is_public) {
      return res.status(403).json({ status: 'error', message: 'This idea is not public.' });
    }

    if (ideaData.user_id === userId) {
      return res.status(403).json({ status: 'error', message: 'You cannot vote for your own idea.' });
    }

    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('idea_id', idea_id)
      .maybeSingle();

    if (existingVote) {
      return res.status(400).json({ status: 'error', message: 'You have already voted for this idea.' });
    }

    const voteData = {
      user_id: userId,
      idea_id: idea_id,
      competition_id: competition_id,
      score: 1,
    };
    if (innovation_rating !== undefined) voteData.innovation_rating = innovation_rating;
    if (impact_rating !== undefined) voteData.impact_rating = impact_rating;
    if (feasibility_rating !== undefined) voteData.feasibility_rating = feasibility_rating;
    if (comment !== undefined) voteData.comment = comment;

    let { error: voteError } = await supabase.from('votes').insert(voteData);

    if (voteError) {
      if (voteError.code === '23505') {
        return res.status(400).json({ status: 'error', message: 'You have already voted for this idea.' });
      }
      // Retry without rating fields if columns don't exist
      if (voteError.code === '42703') {
        const fallbackVote = { user_id: userId, idea_id, competition_id, score: 1 };
        const { error: fallbackError } = await supabase.from('votes').insert(fallbackVote);
        if (fallbackError) {
          if (fallbackError.code === '23505') {
            return res.status(400).json({ status: 'error', message: 'You have already voted for this idea.' });
          }
          throw fallbackError;
        }
      } else {
        throw voteError;
      }
    }

    const { error: countError } = await supabase
      .from('ideas')
      .update({ votes_count: (ideaData.votes_count || 0) + 1 })
      .eq('id', idea_id);

    if (countError) throw countError;

    res.json({ status: 'success', message: 'Vote cast successfully!' });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error while voting.' });
  }
};

const getLeaderboard = async (req, res) => {
  const { competitionId } = req.params;

  if (!competitionId) {
    return res.status(400).json({ status: 'error', message: 'competitionId is required' });
  }

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        id, title, user_id, votes_count,
        users!inner(full_name)
      `)
      .eq('competition_id', competitionId)
      .eq('status', 'approved')
      .eq('is_public', true)
      .order('votes_count', { ascending: false });

    if (error) throw error;

    const leaderboard = (data || []).map((idea, index) => ({
      rank: index + 1,
      id: idea.id,
      title: idea.title,
      user_id: idea.user_id,
      contestant_name: idea.users?.full_name || 'Unknown',
      vote_count: idea.votes_count || 0,
    }));

    res.json({ status: 'success', data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch leaderboard' });
  }
};

const getIdeaRatings = async (req, res) => {
  const { ideaId } = req.params;

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('innovation_rating, impact_rating, feasibility_rating, comment')
      .eq('idea_id', ideaId);

    if (error) {
      // Columns may not exist yet — return empty stats
      return res.json({
        status: 'success',
        data: { total_votes: 0, avg_innovation_rating: 0, avg_impact_rating: 0, avg_feasibility_rating: 0, avg_total: 0, comments: [] },
      });
    }

    const count = data?.length || 0;
    let avgInnovation = 0, avgImpact = 0, avgFeasibility = 0;
    const comments = [];

    if (data) {
      data.forEach((v) => {
        if (v.innovation_rating) avgInnovation += Number(v.innovation_rating);
        if (v.impact_rating) avgImpact += Number(v.impact_rating);
        if (v.feasibility_rating) avgFeasibility += Number(v.feasibility_rating);
        if (v.comment) comments.push(v.comment);
      });
      if (count) {
        avgInnovation /= count;
        avgImpact /= count;
        avgFeasibility /= count;
      }
    }

    res.json({
      status: 'success',
      data: {
        total_votes: count,
        avg_innovation_rating: Math.round(avgInnovation * 10) / 10,
        avg_impact_rating: Math.round(avgImpact * 10) / 10,
        avg_feasibility_rating: Math.round(avgFeasibility * 10) / 10,
        avg_total: Math.round((avgInnovation + avgImpact + avgFeasibility) / 3 * 10) / 10,
        comments,
      },
    });
  } catch (error) {
    console.error('Error fetching idea ratings:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch ratings' });
  }
};

module.exports = { castVote, getUserVotes, castVoteV2, getLeaderboard, getIdeaRatings };

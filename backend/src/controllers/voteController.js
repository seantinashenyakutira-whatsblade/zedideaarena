const { supabase } = require('../config/supabase');

const castVote = async (req, res) => {
  const {
    idea_id, competition_id, ideaId, competitionId,
    innovation_score, feasibility_score,
    impact_score, presentation_score,
    comment, time_spent_seconds,
  } = req.body;
  const ideaIdFinal = idea_id || ideaId;
  const compIdFinal = competition_id || competitionId;
  const userId = req.user.uid;

  if (!ideaIdFinal || !compIdFinal) {
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
    if (!paidComps.includes(compIdFinal)) {
      return res.status(403).json({ status: 'error', message: 'You must pay the voter fee for this competition to vote.' });
    }

    const { data: compData, error: compError } = await supabase
      .from('competitions')
      .select('submission_deadline, end_date')
      .eq('id', compIdFinal)
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
      .select('id, user_id, status, is_public')
      .eq('id', ideaIdFinal)
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
      .eq('idea_id', ideaIdFinal)
      .maybeSingle();

    if (existingVote) {
      return res.status(400).json({ status: 'error', message: 'You have already voted for this idea.' });
    }

    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        idea_id: ideaIdFinal,
        competition_id: compIdFinal,
        innovation_score: innovation_score || 1,
        feasibility_score: feasibility_score || 1,
        impact_score: impact_score || 1,
        presentation_score: presentation_score || 1,
        comment: comment || null,
        time_spent_seconds: time_spent_seconds || 0,
      })
      .select()
      .single();

    if (voteError) {
      if (voteError.code === '23505') {
        return res.status(400).json({ status: 'error', message: 'You have already voted for this idea.' });
      }
      throw voteError;
    }

    await supabase.rpc('add_voter_vote_bonus', {
      p_voter_id: userId,
      p_competition_id: compIdFinal,
    }).catch(err => console.error('Vote bonus RPC error:', err));

    res.json({ status: 'success', message: 'Vote cast successfully!', vote });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error while voting.' });
  }
};

const getUserVotes = async (req, res) => {
  const userId = req.user.uid;

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('idea_id, competition_id, innovation_score, feasibility_score, impact_score, presentation_score, total_score, comment, time_spent_seconds, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch votes' });
  }
};

const castVoteV2 = castVote;

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
      .select('innovation_score, feasibility_score, impact_score, presentation_score, comment')
      .eq('idea_id', ideaId);

    if (error) {
      return res.json({
        status: 'success',
        data: { total_votes: 0, avg_innovation_score: 0, avg_feasibility_score: 0, avg_impact_score: 0, avg_presentation_score: 0, avg_total: 0, comments: [] },
      });
    }

    const count = data?.length || 0;
    let avgInnovation = 0, avgFeasibility = 0, avgImpact = 0, avgPresentation = 0;
    const comments = [];

    if (data) {
      data.forEach((v) => {
        if (v.innovation_score) avgInnovation += Number(v.innovation_score);
        if (v.feasibility_score) avgFeasibility += Number(v.feasibility_score);
        if (v.impact_score) avgImpact += Number(v.impact_score);
        if (v.presentation_score) avgPresentation += Number(v.presentation_score);
        if (v.comment) comments.push(v.comment);
      });
      if (count) {
        avgInnovation /= count;
        avgFeasibility /= count;
        avgImpact /= count;
        avgPresentation /= count;
      }
    }

    res.json({
      status: 'success',
      data: {
        total_votes: count,
        avg_innovation_score: Math.round(avgInnovation * 10) / 10,
        avg_feasibility_score: Math.round(avgFeasibility * 10) / 10,
        avg_impact_score: Math.round(avgImpact * 10) / 10,
        avg_presentation_score: Math.round(avgPresentation * 10) / 10,
        avg_total: Math.round((avgInnovation + avgFeasibility + avgImpact + avgPresentation) / 4 * 10) / 10,
        comments,
      },
    });
  } catch (error) {
    console.error('Error fetching idea ratings:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch ratings' });
  }
};

module.exports = { castVote, getUserVotes, castVoteV2, getLeaderboard, getIdeaRatings };

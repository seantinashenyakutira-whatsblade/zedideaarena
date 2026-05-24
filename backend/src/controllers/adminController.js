const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { sendIdeaApproved, sendIdeaRejected, sendVoterVerified } = require('../services/emailService');

const logAdminAction = async (admin_id, action_type, target_id, target_type, note = '') => {
  try {
    await supabase.from('admin_actions').insert({
      id: uuidv4(),
      admin_id,
      action_type,
      target_id,
      target_type,
      note,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

const createCompetition = async (req, res) => {
  const { title, description, thumbnail_url, submission_deadline, start_date, end_date, entry_fee_cents, voter_fee_cents, prize_pool_cents } = req.body;

  if (!title || !submission_deadline || !start_date || !end_date) {
    return res.status(400).json({ status: 'error', message: 'Title, Submission Deadline, Start Date, and End Date are required' });
  }

  try {
    const compId = uuidv4();
    const { error } = await supabase.from('competitions').insert({
      id: compId,
      title,
      description: description || '',
      thumbnail_url: thumbnail_url || '',
      start_date,
      end_date,
      submission_deadline,
      entry_fee_cents: entry_fee_cents || 500,
      voter_fee_cents: voter_fee_cents || 0,
      prize_pool_cents: prize_pool_cents || 0,
      created_by: req.user.uid,
      is_deleted: false,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAdminAction(req.user.uid, 'competition_created', compId, 'competition', title);

    res.json({ status: 'success', id: compId, message: 'Competition created successfully' });
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const getCompetitions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .neq('is_deleted', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = new Date();
    const comps = (data || []).map((comp) => {
      const startDate = new Date(comp.start_date);
      const deadline = new Date(comp.submission_deadline);

      let calculatedStatus = 'upcoming';
      if (now > deadline) calculatedStatus = 'closed';
      else if (now >= startDate) calculatedStatus = 'active';

      const { entry_fee, ...rest } = comp;

      return {
        ...rest,
        entry_fee_cents: comp.entry_fee_cents || (entry_fee ? Math.round(Number(entry_fee) * 100) : 500),
        calculatedStatus,
      };
    });

    res.json({ status: 'success', data: comps });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: ideasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true });

    const { count: paidIdeasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    const { count: competitionsCount } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })
      .neq('is_deleted', true);

    const { data: prizeSum } = await supabase
      .from('competitions')
      .select('prize_pool_cents')
      .neq('is_deleted', true);

    const totalPrizePoolCents = (prizeSum || []).reduce((sum, c) => sum + (c.prize_pool_cents || 0), 0);

    const { count: votesCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });

    res.json({
      status: 'success',
      data: {
        users: usersCount || 0,
        ideas: ideasCount || 0,
        paidIdeas: paidIdeasCount || 0,
        competitions: competitionsCount || 0,
        totalPrizePoolCents,
        votes: votesCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAllIdeas = async (req, res) => {
  try {
    const { competition_id, status } = req.query;

    let query = supabase
      .from('ideas')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (competition_id) {
      query = query.eq('competition_id', competition_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateIdeaStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const allowedStatuses = ['approved', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Status must be approved or rejected' });
  }

  try {
    const updateFields = { status, admin_note: note || '', updated_at: new Date().toISOString() };

    if (status === 'approved') {
      const { data: idea } = await supabase
        .from('ideas')
        .select('payment_status')
        .eq('id', id)
        .single();

      if (idea && idea.payment_status === 'paid') {
        updateFields.is_public = true;
      }
    }

    const { error } = await supabase
      .from('ideas')
      .update(updateFields)
      .eq('id', id);

    if (error) throw error;

    const actionType = status === 'approved' ? 'idea_approved' : 'idea_rejected';
    await logAdminAction(req.user.uid, actionType, id, 'idea', note || `Status changed to ${status}`);

    const { data: ideaData } = await supabase
      .from('ideas')
      .select('title, user_id')
      .eq('id', id)
      .single();

    if (ideaData) {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', ideaData.user_id)
        .single();

      if (userData?.email) {
        if (status === 'approved') {
          sendIdeaApproved(userData.email, ideaData.title);
        } else {
          sendIdeaRejected(userData.email, ideaData.title, note);
        }
      }
    }

    res.json({ status: 'success', message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { unverified } = req.query;

    let query = supabase
      .from('users')
      .select('id, email, full_name, picture, role, is_verified, is_admin, voter_payment_status, competition_participant, country, created_at')
      .order('created_at', { ascending: false });

    if (unverified === 'true') {
      query = query.eq('is_verified', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const verifyUser = async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  try {
    const { error } = await supabase
      .from('users')
      .update({ is_verified, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    const actionType = is_verified ? 'user_verified' : 'user_unverified';
    await logAdminAction(req.user.uid, actionType, id, 'user');

    if (is_verified) {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .single();

      if (userData?.email) {
        sendVoterVerified(userData.email);
      }
    }

    res.json({ status: 'success', message: `User verification ${is_verified ? 'granted' : 'revoked'}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateCompetition = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updated_at: new Date().toISOString() };

  try {
    const { error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await logAdminAction(req.user.uid, 'competition_edited', id, 'competition', updates.title || '');

    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteCompetition = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('competitions')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await logAdminAction(req.user.uid, 'competition_deleted', id, 'competition');

    res.json({ status: 'success', message: 'Competition deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { data: competitions } = await supabase
      .from('competitions')
      .select('id, title, prize_pool_cents')
      .neq('is_deleted', true);

    const compAnalytics = await Promise.all((competitions || []).map(async (comp) => {
      const { count: entriesCount } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', comp.id);

      const { count: votesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', comp.id);

      return {
        id: comp.id,
        title: comp.title,
        prize_pool_cents: comp.prize_pool_cents || 0,
        entries: entriesCount || 0,
        votes: votesCount || 0,
      };
    }));

    const { data: countries } = await supabase
      .from('users')
      .select('country')
      .not('country', 'is', null);

    const countryCount = {};
    (countries || []).forEach((u) => {
      const c = u.country.trim();
      if (c) countryCount[c] = (countryCount[c] || 0) + 1;
    });

    const geographicBreakdown = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const totalPrizePoolCents = (competitions || []).reduce((sum, c) => sum + (c.prize_pool_cents || 0), 0);

    const { count: totalCompetitions } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })
      .neq('is_deleted', true);

    res.json({
      status: 'success',
      data: {
        competitions: compAnalytics,
        geographicBreakdown,
        revenueEstimateCents: totalPrizePoolCents,
        totalCompetitions: totalCompetitions || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getCompetitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .neq('is_deleted', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ status: 'error', message: 'Competition not found' });
      }
      throw error;
    }

    const now = new Date();
    const startDate = new Date(data.start_date);
    const deadline = new Date(data.submission_deadline);

    let calculatedStatus = 'upcoming';
    if (now > deadline) calculatedStatus = 'closed';
    else if (now >= startDate) calculatedStatus = 'active';

    res.json({ status: 'success', data: { ...data, calculatedStatus } });
  } catch (error) {
    console.error('Get competition by ID error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  getAdminStats,
  getAllIdeas,
  updateIdeaStatus,
  getAllUsers,
  verifyUser,
  updateCompetition,
  deleteCompetition,
  getAnalytics,
  getAuditLog,
};

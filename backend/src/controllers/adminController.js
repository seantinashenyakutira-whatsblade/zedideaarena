const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { sendIdeaApproved, sendIdeaRejected, sendVoterVerified } = require('../services/emailService');
const { notifyIdeaStatusInline, notifyWithdrawalInline } = require('./notificationController');

const DEFAULT_ENTRY_FEE_CENTS = parseInt(process.env.DEFAULT_ENTRY_FEE_CENTS || '500', 10);
const DEFAULT_VOTER_FEE_CENTS = parseInt(process.env.DEFAULT_VOTER_FEE_CENTS || '0', 10);

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
      entry_fee_cents: entry_fee_cents || DEFAULT_ENTRY_FEE_CENTS,
      voter_fee_cents: voter_fee_cents || DEFAULT_VOTER_FEE_CENTS,
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
        entry_fee_cents: comp.entry_fee_cents || (entry_fee ? Math.round(Number(entry_fee) * 100) : DEFAULT_ENTRY_FEE_CENTS),
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

    // Prize pool = entry fee per paid idea
    const prizePoolCents = (paidIdeasCount || 0) * parseInt(process.env.DEFAULT_ENTRY_FEE_CENTS || '500', 10);

    const { count: votesCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });

    // Pending verification counts
    const { count: pendingIdeasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'submitted'])
      .or('payment_status.is.null,payment_status.neq.paid');

    const { count: unverifiedUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .or('is_verified.is.null,is_verified.neq.true');

    const { count: pendingKycCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('identity_document_url', 'is', null)
      .or('is_verified.is.null,is_verified.neq.true');

    const { count: openReportsCount } = await supabase
      .from('arena_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Prize distribution breakdown
    const prizeDistribution = [
      { position: 1, label: '1st Place', share: 0.5, icon: 'trophy', amount_cents: Math.round(prizePoolCents * 0.5) },
      { position: 2, label: '2nd Place', share: 0.3, icon: 'trophy', amount_cents: Math.round(prizePoolCents * 0.3) },
      { position: 3, label: '3rd Place', share: 0.2, icon: 'trophy', amount_cents: Math.round(prizePoolCents * 0.2) },
    ];

    res.json({
      status: 'success',
      data: {
        users: usersCount || 0,
        ideas: ideasCount || 0,
        paidIdeas: paidIdeasCount || 0,
        competitions: competitionsCount || 0,
        totalPrizePoolCents: prizePoolCents,
        votes: votesCount || 0,
        prizeDistribution,
        pending: {
          ideas: pendingIdeasCount || 0,
          users: unverifiedUsersCount || 0,
          kyc: pendingKycCount || 0,
          reports: openReportsCount || 0,
        },
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

    notifyIdeaStatusInline(ideaData.user_id, ideaData.title, status, note);

    res.json({ status: 'success', message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'banned', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await logAdminAction(req.user.uid, 'user_deleted', id, 'user');
    res.json({ status: 'success', message: 'User banned/deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteIdea = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await logAdminAction(req.user.uid, 'idea_deleted', id, 'idea');
    res.json({ status: 'success', message: 'Idea deleted' });
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
  const allowedFields = ['title', 'description', 'thumbnail_url', 'start_date', 'end_date', 'submission_deadline', 'entry_fee_cents', 'voter_fee_cents', 'prize_pool_cents'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  updates.updated_at = new Date().toISOString();

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

const getUserDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { data: ideas } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', id)
      .order('updated_at', { ascending: false });

    const { data: votes } = await supabase
      .from('votes')
      .select('*, ideas(title)')
      .eq('user_id', id);

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    res.json({
      status: 'success',
      data: {
        profile: user,
        ideas: ideas || [],
        votes: votes || [],
        payments: payments || [],
      },
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
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

const getAllWithdrawals = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = supabase
      .from('withdrawal_requests')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const { count } = await supabase
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true });

    res.json({ status: 'success', data: data || [], total: count || 0 });
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch withdrawals' });
  }
};

const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({ status, notes: notes || '', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ status: 'error', message: 'Withdrawal request not found' });

    if (status === 'approved' || status === 'paid') {
      const userName = req.user?.name || 'A user';
      notifyWithdrawalInline(userName, data.amount_cents);
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update withdrawal' });
  }
};

const exportIdeasCSV = async (req, res) => {
  try {
    const { competition_id } = req.query;
    let query = supabase
      .from('ideas')
      .select('*, users(full_name, email), competitions(title)')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (competition_id) query = query.eq('competition_id', competition_id);

    const { data, error } = await query;
    if (error) throw error;

    const headers = ['Title', 'Status', 'Industry', 'Votes', 'Payment', 'Contestant', 'Email', 'Competition', 'Created'];
    const rows = (data || []).map(i => [
      escapeCSV(i.title),
      i.status,
      i.industry || '',
      i.votes_count || 0,
      i.payment_status,
      escapeCSV(i.users?.full_name || ''),
      i.users?.email || '',
      escapeCSV(i.competitions?.title || ''),
      new Date(i.created_at).toISOString().split('T')[0],
    ]);

    sendCSV(res, 'ideas-export.csv', headers, rows);
  } catch (error) {
    console.error('Export ideas error:', error);
    res.status(500).json({ status: 'error', message: 'Export failed' });
  }
};

const exportUsersCSV = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_verified, is_admin, current_mode, onboarding_complete, country, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const headers = ['Name', 'Email', 'Role', 'Mode', 'Verified', 'Admin', 'Onboarding', 'Country', 'Joined'];
    const rows = (data || []).map(u => [
      escapeCSV(u.full_name || ''),
      u.email || '',
      u.role || '',
      u.current_mode || '',
      u.is_verified ? 'Yes' : 'No',
      u.is_admin ? 'Yes' : 'No',
      u.onboarding_complete ? 'Yes' : 'No',
      u.country || '',
      new Date(u.created_at).toISOString().split('T')[0],
    ]);

    sendCSV(res, 'users-export.csv', headers, rows);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ status: 'error', message: 'Export failed' });
  }
};

const exportCompetitionResultsCSV = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: competition } = await supabase.from('competitions').select('title').eq('id', id).single();

    const { data: results } = await supabase.rpc('get_competition_results', { comp_id: id });

    const headers = ['Rank', 'Title', 'Contestant', 'Total Score', 'Innovation', 'Feasibility', 'Impact', 'Presentation', 'Votes'];
    const rows = (results || []).map((r, i) => [
      i + 1,
      escapeCSV(r.title || ''),
      escapeCSV(r.full_name || ''),
      r.total_score?.toFixed(1) || '0',
      r.innovation_score || '0',
      r.feasibility_score || '0',
      r.impact_score || '0',
      r.presentation_score || '0',
      r.votes_count || 0,
    ]);

    sendCSV(res, `${(competition?.title || 'competition').replace(/\s+/g, '_')}-results.csv`, headers, rows);
  } catch (error) {
    console.error('Export competition results error:', error);
    res.status(500).json({ status: 'error', message: 'Export failed' });
  }
};

function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function sendCSV(res, filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

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
  deleteUser,
  deleteIdea,
  getAnalytics,
  getAuditLog,
  getUserDetail,
  getAllWithdrawals,
  updateWithdrawalStatus,
  exportIdeasCSV,
  exportUsersCSV,
  exportCompetitionResultsCSV,
};

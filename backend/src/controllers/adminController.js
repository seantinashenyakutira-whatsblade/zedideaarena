const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const createCompetition = async (req, res) => {
  const { title, description, startDate, endDate, prizePool } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'Title, Start Date, and End Date are required' });
  }

  try {
    const compId = uuidv4();
    const { error } = await supabase.from('competitions').insert({
      id: compId,
      title,
      description: description || '',
      start_date: startDate,
      end_date: endDate,
      submission_deadline: endDate,
      entry_fee: 5,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

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
      .order('created_at', { ascending: false });

    if (error) throw error;

    const comps = (data || []).map((comp) => {
      const now = new Date();
      const startDate = new Date(comp.start_date);
      const deadline = new Date(comp.submission_deadline);

      let status = 'upcoming';
      if (now > deadline) status = 'closed';
      else if (now >= startDate) status = 'active';

      return { ...comp, calculatedStatus: status };
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

    res.json({
      status: 'success',
      data: {
        users: usersCount || 0,
        ideas: ideasCount || 0,
        paidIdeas: paidIdeasCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAllIdeas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateIdeaStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { error } = await supabase
      .from('ideas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, picture, role, is_verified, voter_payment_status, competition_participant, created_at')
      .order('created_at', { ascending: false });

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

    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getAdminStats,
  getAllIdeas,
  updateIdeaStatus,
  getAllUsers,
  verifyUser,
  updateCompetition,
};

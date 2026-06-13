const { supabase } = require('../config/supabase');

const submitReport = async (req, res) => {
  try {
    const reporterId = req.user.uid;
    const { target_type, target_id, reason, description } = req.body;

    const validTypes = ['post', 'comment', 'message', 'profile'];
    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ status: 'error', message: 'target_type, target_id, and reason are required' });
    }
    if (!validTypes.includes(target_type)) {
      return res.status(400).json({ status: 'error', message: 'Invalid target_type. Must be: post, comment, message, or profile' });
    }

    const { data, error } = await supabase
      .from('arena_reports')
      .insert({
        reporter_id: reporterId,
        target_type,
        target_id,
        reason,
        description: description || '',
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', data, message: 'Report submitted. Our team will review it.' });
  } catch (err) {
    console.error('Submit report error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('arena_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ status: 'success', data: data || [] });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.uid;

    const validStatuses = ['open', 'reviewed', 'dismissed', 'action_taken'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('arena_reports')
      .update({
        status,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (err) {
    console.error('Update report error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { submitReport, getReports, updateReportStatus };
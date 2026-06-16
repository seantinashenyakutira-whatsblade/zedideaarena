const { supabase } = require('../config/supabase');

const DEFAULT_CATEGORIES = {
  idea_approved: { push: true, sound: true, priority: 'high' },
  verification: { push: true, sound: true, priority: 'high' },
  payments: { push: true, sound: true, priority: 'high' },
  arena_engagement: { push: true, sound: true, priority: 'low' },
  reports: { push: true, sound: true, priority: 'high' },
  new_competitions: { push: true, sound: true, priority: 'low' },
  messages: { push: true, sound: true, priority: 'high' },
  admin_new_ideas: { push: true, sound: true, priority: 'high' },
  admin_arena_engagement: { push: true, sound: true, priority: 'low' },
  admin_messages: { push: true, sound: true, priority: 'low' },
  admin_payments: { push: true, sound: true, priority: 'high' },
  admin_new_users: { push: true, sound: true, priority: 'low' },
  admin_reports: { push: true, sound: true, priority: 'high' },
  admin_withdrawals: { push: true, sound: true, priority: 'high' },
};

const SOUND_OPTIONS = ['chime', 'pop', 'alert', 'bell', 'ping'];

const getPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;

    let { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      data = {
        user_id: userId,
        push_enabled: true,
        sound_enabled: true,
        sound_name: 'chime',
        categories: DEFAULT_CATEGORIES,
      };
    } else if (error) {
      throw error;
    }

    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { push_enabled, sound_enabled, sound_name, categories } = req.body;

    if (sound_name && !SOUND_OPTIONS.includes(sound_name)) {
      return res.status(400).json({ status: 'error', message: `Sound must be one of: ${SOUND_OPTIONS.join(', ')}` });
    }

    const existing = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    const payload = { updated_at: new Date().toISOString() };
    if (typeof push_enabled === 'boolean') payload.push_enabled = push_enabled;
    if (typeof sound_enabled === 'boolean') payload.sound_enabled = sound_enabled;
    if (sound_name) payload.sound_name = sound_name;
    if (categories) payload.categories = categories;

    if (existing.data) {
      const { error } = await supabase
        .from('notification_preferences')
        .update(payload)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      payload.user_id = userId;
      if (!payload.categories) payload.categories = DEFAULT_CATEGORIES;
      const { error } = await supabase
        .from('notification_preferences')
        .insert(payload);
      if (error) throw error;
    }

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  SOUND_OPTIONS,
  DEFAULT_CATEGORIES,
};

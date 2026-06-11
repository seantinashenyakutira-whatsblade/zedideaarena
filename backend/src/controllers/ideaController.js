const { supabase } = require('../config/supabase');
const { sendIdeaConfirmation } = require('../services/emailService');

const saveIdeaDraft = async (req, res) => {
  const { uid } = req.user;
  const { id, title, category, competition_id, problem_statement, description, video_url, image_url, deck_url, estimated_impact, target_audience, timeline, links } = req.body;

  try {
    if (id) {
      const { data: existing } = await supabase
        .from('ideas')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (existing) {
        if (existing.user_id !== uid) {
          return res.status(403).json({ status: 'error', message: 'Unauthorized: You do not own this idea' });
        }
        if (existing.status === 'submitted') {
          return res.status(400).json({ status: 'error', message: 'Cannot edit an idea that has already been submitted' });
        }
      }
    }

    const ideaData = {
      user_id: uid,
      title: title || '',
      category: category || '',
      competition_id: competition_id || null,
      problem_statement: problem_statement || '',
      description: description || '',
      video_url: video_url || '',
      image_url: image_url || '',
      deck_url: deck_url || '',
      links: links || {},
      status: 'draft',
      payment_status: 'unpaid',
      votes_count: 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from('ideas').update(ideaData).eq('id', id).select('id').single();
    } else {
      ideaData.created_at = new Date().toISOString();
      result = await supabase.from('ideas').insert(ideaData).select('id').single();
    }

    if (result.error) throw result.error;

    res.json({ status: 'success', id: result.data.id, message: 'Idea draft saved successfully' });
  } catch (error) {
    console.error('Error saving idea draft:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save draft' });
  }
};

const submitIdea = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ status: 'error', message: 'Idea ID is required for submission' });
  }

  try {
    const { data: doc, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !doc || doc.user_id !== uid) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    if (!doc.title) {
      return res.status(400).json({
        status: 'error',
        message: 'Incomplete idea data. Please fill in all required fields before submitting.',
      });
    }

    if (doc.status === 'submitted') {
      return res.status(400).json({ status: 'error', message: 'Idea already submitted' });
    }

    const { error } = await supabase
      .from('ideas')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    sendIdeaConfirmation(req.user.email, doc.title);

    res.json({ status: 'success', message: 'Idea submitted successfully and is now under review' });
  } catch (error) {
    console.error('Error submitting idea:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit idea' });
  }
};

const getUserIdeas = async (req, res) => {
  const { uid } = req.user;

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    console.error('Error fetching user ideas:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch ideas' });
  }
};

const getPublicIdeas = async (req, res) => {
  try {
    const statusFilter = req.query.status || 'submitted';
    const competitionId = req.query.competition_id || null;

    let query = supabase
      .from('ideas')
      .select('*, users(full_name)')
      .eq('status', statusFilter)
      .eq('is_public', true)
      .order('votes_count', { ascending: false });

    if (statusFilter === 'submitted') {
      query = query.eq('payment_status', 'paid');
    }

    if (competitionId) {
      query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const mapped = (data || []).map((idea) => {
      const { users, ...rest } = idea;
      return { ...rest, users: { full_name: users?.full_name } };
    });

    res.json({ status: 'success', data: mapped });
  } catch (error) {
    console.error('Error fetching public ideas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getIdeaById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    res.json({ status: 'success', data: { id: data.id, ...data } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createIdea = async (req, res) => {
  const { uid } = req.user;
  const {
    title, problem, solution, industry, business_model,
    competition_id, pitch_video_url, github_url, linkedin_url, instagram_url
  } = req.body;

  if (!title || !problem || !solution) {
    return res.status(400).json({ status: 'error', message: 'Title, problem, and solution are required' });
  }

  try {
    // 3-ideas-per-competition limit
    if (competition_id) {
      const { count } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('competition_id', competition_id);

      if (count && count >= 3) {
        return res.status(400).json({ status: 'error', message: 'You can only submit up to 3 ideas per competition' });
      }
    }

    const ideaData = {
      user_id: uid,
      title,
      problem: problem || '',
      solution: solution || '',
      industry: industry || '',
      business_model: business_model || '',
      competition_id: competition_id || null,
      pitch_video_url: pitch_video_url || '',
      github_url: github_url || '',
      linkedin_url: linkedin_url || '',
      instagram_url: instagram_url || '',
      status: 'pending',
      payment_status: 'unpaid',
      is_public: false,
      votes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ideas')
      .insert(ideaData)
      .select('id')
      .single();

    if (error) throw error;

    res.json({ status: 'success', id: data.id, message: 'Idea submitted successfully and is pending review' });
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { saveIdeaDraft, submitIdea, getUserIdeas, getPublicIdeas, getIdeaById, createIdea };

const { supabase } = require('../config/supabase');
const { sendIdeaConfirmation } = require('../services/emailService');
const { notifyNewIdeaInline } = require('./notificationController');

const saveIdeaDraft = async (req, res) => {
  const { uid } = req.user;
  let {
    id, title, category, competition_id,
    problem, problem_statement, solution, description,
    industry, business_model,
    pitch_video_url, video_url,
    github_url, linkedin_url, instagram_url,
    image_url, deck_url, collaborators, links
  } = req.body;

  try {
    if (!id) {
      const { data: existingDraft } = await supabase
        .from('ideas')
        .select('id')
        .eq('user_id', uid)
        .eq('competition_id', competition_id || null)
        .eq('status', 'draft')
        .limit(1);

      if (existingDraft && existingDraft.length > 0) {
        id = existingDraft[0].id;
      }
    }

    if (title) {
      const { data: sameTitle } = await supabase
        .from('ideas')
        .select('id, status')
        .eq('user_id', uid)
        .eq('title', title)
        .limit(1);

      if (sameTitle && sameTitle.length > 0 && sameTitle[0].id !== id) {
        return res.status(409).json({ status: 'error', message: 'You already have an idea with this title. Please use a different title or edit your existing idea.' });
      }
    }

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
        if (existing.status === 'approved') {
          return res.status(400).json({ status: 'error', message: 'Cannot edit an approved idea' });
        }
      } else {
        id = null;
      }
    }

    const ideaData = {
      user_id: uid,
      title: title || '',
      category: category || industry || '',
      competition_id: competition_id || null,
      problem_statement: problem_statement || problem || '',
      description: description || solution || '',
      industry: industry || category || '',
      business_model: business_model || '',
      pitch_video_url: pitch_video_url || video_url || '',
      video_url: video_url || pitch_video_url || '',
      github_url: github_url || '',
      linkedin_url: linkedin_url || '',
      instagram_url: instagram_url || '',
      collaborators: collaborators || [],
      image_url: image_url || '',
      deck_url: deck_url || '',
      links: links || {},
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from('ideas').update(ideaData).eq('id', id).select('id').single();
    } else {
      ideaData.status = 'draft';
      ideaData.payment_status = 'unpaid';
      ideaData.votes_count = 0;
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

    if (doc.status === 'submitted' || doc.status === 'pending') {
      return res.json({ status: 'success', message: 'Idea already submitted' });
    }

    if (doc.status === 'approved') {
      return res.json({ status: 'success', message: 'Idea is already approved' });
    }

    const appealCount = doc.appeal_count || 0;
    if (doc.status === 'rejected' && appealCount >= 5) {
      return res.status(400).json({ status: 'error', message: 'Maximum appeals reached (5/5). You can no longer appeal this idea.' });
    }

    const updateData = {
      status: 'submitted',
      updated_at: new Date().toISOString(),
    };

    if (doc.status === 'rejected') {
      updateData.appeal_count = appealCount + 1;
    }

    const { error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    sendIdeaConfirmation(req.user.email, doc.title);

    notifyNewIdeaInline(doc.title, uid);

    const msg = doc.status === 'rejected'
      ? `Appeal submitted (${appealCount + 1}/5). Your idea is back under review.`
      : 'Idea submitted successfully and is now under review';

    res.json({ status: 'success', message: msg });
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
      .select('*, users(full_name, picture)')
      .in('status', statusFilter === 'approved' ? ['approved'] : ['submitted', 'approved'])
      .eq('is_public', true)
      .order('votes_count', { ascending: false });

    if (statusFilter === 'submitted' || statusFilter === 'approved') {
      query = query.eq('payment_status', 'paid');
    }

    if (competitionId) {
      query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const mapped = (data || []).map((idea) => {
      const { users, ...rest } = idea;
      return { ...rest, users: { full_name: users?.full_name, picture: users?.picture } };
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

    if (!req.user || req.user.uid !== data.user_id) {
      const { user_id, ...rest } = data;
      return res.json({ status: 'success', data: { id: data.id, ...rest } });
    }

    res.json({ status: 'success', data: { id: data.id, ...data } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getPublicIdeaById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*, users!inner(full_name, picture)')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ status: 'error', message: 'Idea not found or not public' });
    }

    const { users, ...rest } = data;
    res.json({ status: 'success', data: { ...rest, creator: users } });
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

const deleteOwnIdea = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.params;

  try {
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !idea) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    if (idea.user_id !== uid) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized: You do not own this idea' });
    }

    const { error } = await supabase
      .from('ideas')
      .update({ status: 'deleted', is_public: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete idea' });
  }
};

const getIdeaInsights = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.params;

  try {
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !idea) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    if (idea.user_id !== uid) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized: You do not own this idea' });
    }

    let votes = [];
    let votesCount = 0;
    let avgInnovation = 0, avgImpact = 0, avgFeasibility = 0;

    try {
      const { data: v, error: votesError } = await supabase
        .from('votes')
        .select('innovation_score, feasibility_score, impact_score, presentation_score, comment, created_at')
        .eq('idea_id', id);

      if (!votesError && v) {
        votes = v;
        votesCount = v.length;
        v.forEach((vote) => {
          if (vote.innovation_score != null) avgInnovation += Number(vote.innovation_score);
          if (vote.impact_score != null) avgImpact += Number(vote.impact_score);
          if (vote.feasibility_score != null) avgFeasibility += Number(vote.feasibility_score);
        });
        if (votesCount) {
          avgInnovation /= votesCount;
          avgImpact /= votesCount;
          avgFeasibility /= votesCount;
        }
      }
    } catch (err) { console.error('getIdeaInsights error:', err?.message || err); }

    // Fallback: just count votes without ratings
    if (!votes.length) {
      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', id);
      votesCount = count || 0;
    }

    res.json({
      status: 'success',
      data: {
        idea,
        votes_count: votesCount,
        avg_innovation_rating: Math.round(avgInnovation * 10) / 10,
        avg_impact_rating: Math.round(avgImpact * 10) / 10,
        avg_feasibility_rating: Math.round(avgFeasibility * 10) / 10,
        avg_total: Math.round((avgInnovation + avgImpact + avgFeasibility) / 3 * 10) / 10,
        votes: votes,
      },
    });
  } catch (error) {
    console.error('Error fetching idea insights:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch insights' });
  }
};

const updateIdeaSettings = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.params;
  const { collaborators } = req.body;

  try {
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !idea) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    if (idea.user_id !== uid) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized: You do not own this idea' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (collaborators !== undefined) updates.collaborators = collaborators;

    const { error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Idea settings updated' });
  } catch (error) {
    console.error('Error updating idea settings:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update settings' });
  }
};

const addCollaborator = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.params;
  const { name, role, github, linkedin, instagram, facebook } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Name is required' });
  }

  try {
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id, title, collaborators')
      .eq('id', id)
      .single();

    if (fetchError || !idea) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }

    if (idea.user_id !== uid) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized: You do not own this idea' });
    }

    let collabs = [];
    try {
      collabs = typeof idea.collaborators === 'string' ? JSON.parse(idea.collaborators || '[]') : (idea.collaborators || []);
    } catch { collabs = []; }

    const newCollab = {
      name,
      role: role || '',
      github: github || '',
      linkedin: linkedin || '',
      instagram: instagram || '',
      facebook: facebook || '',
      added_at: new Date().toISOString(),
    };
    collabs.push(newCollab);

    const { error: updateError } = await supabase
      .from('ideas')
      .update({ collaborators: JSON.stringify(collabs), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ status: 'success', data: collabs, message: 'Collaborator added' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add collaborator' });
  }
};

module.exports = { saveIdeaDraft, submitIdea, getUserIdeas, getPublicIdeas, getPublicIdeaById, getIdeaById, createIdea, deleteOwnIdea, getIdeaInsights, updateIdeaSettings, addCollaborator };

const { db } = require('../config/firebase');

/**
 * Save Idea Draft
 * Creates or updates an idea with 'draft' status.
 */
const saveIdeaDraft = async (req, res) => {
  const { uid } = req.user;
  const { id, title, category, competition_id, problem_statement, description, video_url, image_url, deck_url, estimated_impact, target_audience, timeline, links } = req.body;

  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        status: 'success', 
        id: id || 'mock-idea-' + Date.now(), 
        message: 'Idea draft saved (Simulated)' 
      });
    }
    return res.status(503).json({ status: 'error', message: 'Database service unavailable' });
  }

  try {
    const ideaRef = id ? db.collection('ideas').doc(id) : db.collection('ideas').doc();
    
    if (id) {
      const existing = await ideaRef.get();
      if (existing.exists) {
        // Ownership check
        if (existing.data().user_id !== uid) {
          return res.status(403).json({ 
            status: 'error', 
            message: 'Unauthorized: You do not own this idea' 
          });
        }
        // State check
        if (existing.data().status === 'submitted') {
          return res.status(400).json({ 
            status: 'error', 
            message: 'Cannot edit an idea that has already been submitted' 
          });
        }
      }
    }

    const ideaData = {
      user_id: uid,
      title: title || '',
      category: category || '',
      competition_id: competition_id || '',
      problem_statement: problem_statement || '',
      description: description || '',
      video_url: video_url || '',
      image_url: image_url || '',
      deck_url: deck_url || '',
      estimated_impact: estimated_impact || '',
      target_audience: target_audience || '',
      timeline: timeline || '',
      links: links || {},
      status: 'draft',
      payment_status: 'unpaid',
      votes_count: 0,
      updatedAt: new Date().toISOString()
    };

    if (!id) {
      ideaData.createdAt = new Date().toISOString();
    }

    await ideaRef.set(ideaData, { merge: true });

    res.json({ 
      status: 'success', 
      id: ideaRef.id, 
      message: 'Idea draft saved successfully' 
    });
  } catch (error) {
    console.error('Error saving idea draft:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to save draft' 
    });
  }
};

/**
 * Submit Idea
 * Finalizes an idea submission and locks it for editing.
 */
const submitIdea = async (req, res) => {
  const { uid } = req.user;
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Idea ID is required for submission' 
    });
  }

  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        status: 'success', 
        message: 'Idea submitted successfully (Simulated)' 
      });
    }
    return res.status(503).json({ status: 'error', message: 'Database service unavailable' });
  }

  try {
    const ideaRef = db.collection('ideas').doc(id);
    const doc = await ideaRef.get();

    if (!doc.exists || doc.data().user_id !== uid) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Idea not found' 
      });
    }

    const data = doc.data();

    // Final Validation before submission
    if (!data.title || !data.category || !data.problem_statement || !data.description) {
      return res.status(400).json({
        status: 'error',
        message: 'Incomplete idea data. Please fill in all required fields (Title, Category, Problem, Description) before submitting.'
      });
    }

    await ideaRef.update({
      status: 'submitted',
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      status: 'success', 
      message: 'Idea submitted successfully and is now under review' 
    });
  } catch (error) {
    console.error('Error submitting idea:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to submit idea' 
    });
  }
};

/**
 * Get User Ideas
 * Returns all ideas (drafts and submitted) for the authenticated user.
 */
const getUserIdeas = async (req, res) => {
  const { uid } = req.user;

  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        status: 'success', 
        data: [] 
      });
    }
    return res.status(503).json({ status: 'error', message: 'Database service unavailable' });
  }

  try {
    const snapshot = await db.collection('ideas')
      .where('user_id', '==', uid)
      .orderBy('updatedAt', 'desc')
      .get();

    const ideas = [];
    snapshot.forEach(doc => {
      ideas.push({ id: doc.id, ...doc.data() });
    });

    res.json({ 
      status: 'success', 
      data: ideas 
    });
  } catch (error) {
    console.error('Error fetching user ideas:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch ideas' 
    });
  }
};

/**
 * Get Public Ideas
 */
const getPublicIdeas = async (req, res) => {
  try {
    const snapshot = await db.collection('ideas')
      .where('status', '==', 'submitted')
      .where('payment_status', '==', 'paid')
      .get();

    const ideas = [];
    snapshot.forEach(doc => {
      ideas.push({ id: doc.id, ...doc.data() });
    });

    res.json({ status: 'success', data: ideas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get Idea by ID
 */
const getIdeaById = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('ideas').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ status: 'error', message: 'Idea not found' });
    }
    res.json({ status: 'success', data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  saveIdeaDraft,
  submitIdea,
  getUserIdeas,
  getPublicIdeas,
  getIdeaById
};

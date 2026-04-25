const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle Competition Creation
 */
const createCompetition = async (req, res) => {
  const { title, description, startDate, endDate, prizePool } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'Title, Start Date, and End Date are required' });
  }

  try {
    const compId = uuidv4();
    await db.collection('competitions').doc(compId).set({
      id: compId,
      title,
      description: description || '',
      startDate,
      endDate,
      prizePool: prizePool || 0,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    });

    res.json({
      status: 'success',
      id: compId,
      message: 'Competition created successfully'
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const getCompetitions = async (req, res) => {
  try {
    const snapshot = await db.collection('competitions').get();
    const comps = snapshot.docs.map(doc => doc.data());
    res.json(comps);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  createCompetition,
  getCompetitions
};

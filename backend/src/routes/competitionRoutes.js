const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route GET /api/competitions
 * @desc Get all active competitions
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const compSnap = await db.collection('competitions').get();
    const competitions = compSnap.docs.map(doc => {
      const data = doc.data();
      const now = new Date();
      const startDate = new Date(data.start_date);
      const deadline = new Date(data.submission_deadline);
      
      let status = 'upcoming';
      if (now > deadline) status = 'closed';
      else if (now >= startDate) status = 'active';

      return { 
        id: doc.id, 
        ...data,
        calculatedStatus: status
      };
    });
    
    // Seed default if empty
    if (competitions.length === 0) {
      const defaultComp = {
        title: 'Idea to Win 2024',
        description: 'The premier innovation competition for global impact. Pitch your vision to a panel of experts and win funding.',
        thumbnail_url: '/placeholder.jpg',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        submission_deadline: '2026-06-20T23:59:59Z',
        entry_fee: 5,
        status: 'active',
        created_at: new Date().toISOString(),
        participants_count: 120,
        ideas_count: 85
      };
      const docRef = await db.collection('competitions').add(defaultComp);
      return res.json({ status: 'success', data: [{ id: docRef.id, ...defaultComp, calculatedStatus: 'active' }] });
    }

    res.json({ status: 'success', data: competitions });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @route GET /api/competitions/:id
 * @desc Get competition details
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('competitions').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Competition not found' });
    
    const data = doc.data();
    const now = new Date();
    const startDate = new Date(data.start_date);
    const deadline = new Date(data.submission_deadline);
    
    let status = 'upcoming';
    if (now > deadline) status = 'closed';
    else if (now >= startDate) status = 'active';

    res.json({ status: 'success', data: { id: doc.id, ...data, calculatedStatus: status } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @route POST /api/competitions
 * @desc Create new competition (Admin only)
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const newComp = {
      ...req.body,
      created_at: new Date().toISOString(),
      participants_count: 0,
      ideas_count: 0
    };
    const docRef = await db.collection('competitions').add(newComp);
    res.json({ status: 'success', id: docRef.id });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @route PUT /api/competitions/:id
 * @desc Update competition (Admin only)
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.collection('competitions').doc(req.params.id).update({
      ...req.body,
      updated_at: new Date().toISOString()
    });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

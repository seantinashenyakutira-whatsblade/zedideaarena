const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route GET /api/admin/stats
 * @desc Get global platform stats for admin
 * @access Admin
 */
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const usersCount = await db.collection('users').count().get();
    const ideasCount = await db.collection('ideas').count().get();
    const paidIdeasCount = await db.collection('ideas').where('payment_status', '==', 'paid').count().get();

    res.json({
      status: 'success',
      data: {
        users: usersCount.data().count,
        ideas: ideasCount.data().count,
        paidIdeas: paidIdeasCount.data().count
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @route GET /api/admin/ideas
 * @desc Get all ideas for moderation
 * @access Admin
 */
router.get('/ideas', verifyToken, isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('ideas').orderBy('updatedAt', 'desc').limit(50).get();
    const ideas = [];
    snapshot.forEach(doc => {
      ideas.push({ id: doc.id, ...doc.data() });
    });
    res.json({ status: 'success', data: ideas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @route POST /api/admin/ideas/:id/status
 * @desc Update idea status
 * @access Admin
 */
router.post('/ideas/:id/status', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.collection('ideas').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });
    res.json({ status: 'success', message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

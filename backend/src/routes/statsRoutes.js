const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * @route GET /api/stats/global
 * @desc Get global platform statistics
 * @access Public
 */
router.get('/global', async (req, res) => {
  try {
    const ideasSnap = await db.collection('ideas').where('payment_status', '==', 'paid').count().get();
    const usersSnap = await db.collection('users').count().get();
    
    // For funding, we'd sum up prizes, but let's mock or use a constant for now
    // since we don't have a prize pool yet
    const fundingDistributed = 50000; // $50k

    res.json({
      status: 'success',
      data: {
        activeIdeas: ideasSnap.data().count,
        communityMembers: usersSnap.data().count,
        fundingDistributed: fundingDistributed,
        countries: 12 // Mock constant
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

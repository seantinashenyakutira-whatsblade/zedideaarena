const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.get('/global', async (req, res) => {
  try {
    const { count: ideasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const fundingDistributed = 50000;

    res.json({
      status: 'success',
      data: {
        activeIdeas: ideasCount || 0,
        communityMembers: usersCount || 0,
        fundingDistributed,
        countries: 12,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

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

    const fundingDistributed = parseInt(process.env.STATS_FUNDING_DISTRIBUTED || '50000', 10);
    const countries = parseInt(process.env.STATS_COUNTRIES || '12', 10);

    res.json({
      status: 'success',
      data: {
        activeIdeas: ideasCount || 0,
        communityMembers: usersCount || 0,
        fundingDistributed,
        countries,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

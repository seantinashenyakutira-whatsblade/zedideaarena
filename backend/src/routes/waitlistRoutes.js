const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

const FREE_PASS_LIMIT = 50;

// Get total waitlist count
router.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return res.json({
      success: true,
      total: count || 0,
      freePassLimit: FREE_PASS_LIMIT,
      spotsRemaining: Math.max(0, FREE_PASS_LIMIT - (count || 0)),
    });
  } catch (error) {
    console.error('Waitlist count error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
});

// Waitlist signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, interest, userType, interests, source, followedChannels } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    const { data: existing } = await supabase
      .from('waitlist_signups')
      .select('email')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return res.status(200).json({ 
        success: true, 
        message: 'You are already on the waitlist',
        freePassEligible: false,
      });
    }

    const metadata = {
      ...(userType && { user_type: userType }),
      ...(interests && Array.isArray(interests) && { interests }),
      ...(source && { source }),
      ...(followedChannels && Array.isArray(followedChannels) && { followed_channels: followedChannels }),
    };

    const insertData = {
      name: name.trim(),
      email: normalizedEmail,
      interest: interest || null,
    };

    if (Object.keys(metadata).length > 0) {
      insertData.metadata = metadata;
    }

    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert([insertData])
      .select();

    if (error) throw error;

    const { count } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true });

    const totalCount = count || 0;
    const freePassEligible = totalCount <= FREE_PASS_LIMIT;

    return res.status(201).json({
      success: true,
      message: 'You have been added to the waitlist',
      data: {
        ...data[0],
        freePassEligible,
        freePassLimit: FREE_PASS_LIMIT,
        totalCount,
      },
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
});

module.exports = router;
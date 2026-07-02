const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Waitlist signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, interest } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if already on waitlist (duplicate prevention)
    const { data: existing } = await supabase
      .from('waitlist_signups')
      .select('email')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return res.status(200).json({ 
        success: true, 
        message: 'You are already on the waitlist' 
      });
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert([{
        name: name.trim(),
        email: normalizedEmail,
        interest: interest || null
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'You have been added to the waitlist',
      data: data[0]
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
});

module.exports = router;
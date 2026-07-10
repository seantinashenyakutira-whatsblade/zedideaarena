const crypto = require('crypto');
const { supabase } = require('../config/supabase');
const emailService = require('../services/emailService');

const FREE_PASS_LIMIT = 50;
const VERIFICATION_EXPIRY_HOURS = 24;
const MAX_VERIFICATION_ATTEMPTS = 3;

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateReferralCode(name) {
  const prefix = (name || '').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') || 'WAIT';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

exports.getCount = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    const verifiedCount = count || 0;
    return res.json({
      success: true,
      total: verifiedCount,
      freePassLimit: FREE_PASS_LIMIT,
      spotsRemaining: Math.max(0, FREE_PASS_LIMIT - verifiedCount),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      name, username, email, country, profession,
      role, interests, goal, challenge,
      marketingConsent, referralCode,
      referralSource, interestedInVoting, interestedInEarning,
      interestedInCompetitions, motivations, hasIdea, interestedInCommunity,
    } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('waitlist_signups')
      .select('id, email_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing?.email_verified) {
      // Onboarding update — update extra fields if provided
      const updates = {};
      if (username !== undefined) updates.username = username.trim() || null;
      if (country !== undefined) updates.country = country || null;
      if (profession !== undefined) updates.profession = profession || null;
      if (role !== undefined) updates.role = role || null;
      if (interests !== undefined) updates.interests = interests || [];
      if (goal !== undefined) updates.goal = goal || null;
      if (challenge !== undefined) updates.challenge = challenge || null;
      if (marketingConsent !== undefined) updates.marketing_consent = marketingConsent;
      if (referralSource !== undefined) updates.referral_source = referralSource || null;
      if (interestedInVoting !== undefined) updates.interested_in_voting = interestedInVoting;
      if (interestedInEarning !== undefined) updates.interested_in_earning = interestedInEarning;
      if (interestedInCompetitions !== undefined) updates.interested_in_competitions = interestedInCompetitions;
      if (motivations !== undefined) updates.motivations = motivations || [];
      if (hasIdea !== undefined) updates.has_idea = hasIdea || null;
      if (interestedInCommunity !== undefined) updates.interested_in_community = interestedInCommunity;

      if (Object.keys(updates).length > 0) {
        await supabase.from('waitlist_signups').update(updates).eq('id', existing.id);
      }

      // Return existing referral code
      const { data: fullUser } = await supabase
        .from('waitlist_signups')
        .select('referral_code')
        .eq('id', existing.id)
        .single();

      return res.status(200).json({
        success: true,
        message: 'Profile updated',
        verified: true,
        data: { referralCode: fullUser?.referral_code || null },
      });
    }

    if (existing && !existing.email_verified) {
      // Resend verification with rate limiting
      const { count: attemptCount } = await supabase
        .from('verification_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email', normalizedEmail)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

      if ((attemptCount || 0) >= MAX_VERIFICATION_ATTEMPTS) {
        return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
      }

      const token = generateToken();
      const hashed = hashToken(token);
      const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      await supabase.from('waitlist_signups').update({
        verification_token: hashed,
        verification_token_expiry: expiresAt,
        name: name.trim(),
        username: username?.trim() || null,
        country: country || null,
        profession: profession || null,
        role: role || null,
        interests: interests || [],
        goal: goal || null,
        challenge: challenge || null,
        marketing_consent: marketingConsent !== false,
        referral_source: referralSource || null,
        interested_in_voting: interestedInVoting ?? false,
        interested_in_earning: interestedInEarning ?? false,
        interested_in_competitions: interestedInCompetitions ?? false,
        motivations: motivations || [],
        has_idea: hasIdea || null,
        interested_in_community: interestedInCommunity ?? false,
      }).eq('id', existing.id);

      await supabase.from('verification_attempts').insert([{
        email: normalizedEmail,
        ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      }]);

      const msgId = await emailService.sendVerificationEmail(normalizedEmail, token, name, role);
      if (!msgId) {
        console.warn('[WAITLIST] Verification email failed to send');
      }

      return res.json({ success: true, message: 'Verification email resent. Check your inbox.', needsVerification: true });
    }

    // Check rate limiting for new signups
    const { count: attemptCount } = await supabase
      .from('verification_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if ((attemptCount || 0) >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
    }

    // Handle referral
    let referredById = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('waitlist_signups')
        .select('id')
        .eq('referral_code', referralCode.toUpperCase())
        .maybeSingle();
      if (referrer) referredById = referrer.id;
    }

    const token = generateToken();
    const hashed = hashToken(token);
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    const refCode = generateReferralCode(name);

    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert([{
        name: name.trim(),
        username: username?.trim() || null,
        email: normalizedEmail,
        country: country || null,
        profession: profession || null,
        role: role || null,
        interests: interests || [],
        goal: goal || null,
        challenge: challenge || null,
        marketing_consent: marketingConsent !== false,
        referral_code: refCode,
        referred_by: referredById,
        verification_token: hashed,
        verification_token_expiry: expiresAt,
        email_verified: false,
        email_status: 'pending',
        referral_source: referralSource || null,
        interested_in_voting: interestedInVoting ?? false,
        interested_in_earning: interestedInEarning ?? false,
        interested_in_competitions: interestedInCompetitions ?? false,
        motivations: motivations || [],
        has_idea: hasIdea || null,
        interested_in_community: interestedInCommunity ?? false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Track attempt
    await supabase.from('verification_attempts').insert([{
      email: normalizedEmail,
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
    }]);

    // Increment referrer's count
    if (referredById) {
      await supabase.rpc('increment_referral_count', { user_id: referredById });
    }

    // Send verification email
    const msgId = await emailService.sendVerificationEmail(normalizedEmail, token, name, role);
    if (!msgId) {
      console.warn('[WAITLIST] Verification email failed to send');
    }

    return res.status(201).json({
      success: true,
      message: 'Check your email to verify your address.',
      needsVerification: true,
      data: { id: data.id, referralCode: refCode },
    });
  } catch (error) {
    console.error('[WAITLIST] Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ success: false, message: 'Token and email are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashed = hashToken(token);

    const { data: entry, error } = await supabase
      .from('waitlist_signups')
      .select('id, verification_token, verification_token_expiry, email_verified, name, role, referral_code')
      .eq('email', normalizedEmail)
      .single();

    if (error || !entry) {
      return res.status(404).json({ success: false, message: 'Email not found on waitlist' });
    }

    if (entry.email_verified) {
      return res.json({ success: true, message: 'Email already verified', verified: true });
    }

    if (!entry.verification_token || entry.verification_token !== hashed) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    if (new Date(entry.verification_token_expiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification token expired. Request a new one.' });
    }

    const { error: updateError } = await supabase
      .from('waitlist_signups')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expiry: null,
        email_status: 'verified',
        joined_date: new Date().toISOString(),
      })
      .eq('id', entry.id);

    if (updateError) throw updateError;

    // Send welcome email
    const msgId = await emailService.sendWelcomeEmail(normalizedEmail, entry.name, entry.role, entry.referral_code);

    // Update referred_by counts
    await supabase
      .from('waitlist_signups')
      .update({ email_status: 'welcomed', last_email_sent: new Date().toISOString(), last_email_type: 'welcome' })
      .eq('id', entry.id);

    return res.json({
      success: true,
      message: 'Email verified successfully! Welcome to the waitlist.',
      verified: true,
      referralCode: entry.referral_code,
    });
  } catch (error) {
    console.error('[WAITLIST] Verify error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: entry, error } = await supabase
      .from('waitlist_signups')
      .select('id, email_verified, name, role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error || !entry) {
      return res.status(404).json({ success: false, message: 'Email not found on waitlist' });
    }

    if (entry.email_verified) {
      return res.json({ success: true, message: 'Email already verified' });
    }

    // Rate limit
    const { count } = await supabase
      .from('verification_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .eq('attempt_type', 'resend')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if ((count || 0) >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many resend requests. Try again later.' });
    }

    const token = generateToken();
    const hashed = hashToken(token);
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    await supabase.from('waitlist_signups').update({
      verification_token: hashed,
      verification_token_expiry: expiresAt,
    }).eq('id', entry.id);

    await supabase.from('verification_attempts').insert([{
      email: normalizedEmail,
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      attempt_type: 'resend',
    }]);

    await emailService.sendVerificationEmail(normalizedEmail, token, entry.name, entry.role);

    return res.json({ success: true, message: 'Verification email resent.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { data: entry, error } = await supabase
      .from('waitlist_signups')
      .select('email_verified, role, joined_date, referral_code, referral_count, email_status')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !entry) {
      return res.json({ success: true, onWaitlist: false });
    }

    return res.json({
      success: true,
      onWaitlist: true,
      verified: entry.email_verified,
      role: entry.role,
      joinedDate: entry.joined_date,
      referralCode: entry.referral_code,
      referralCount: entry.referral_count || 0,
      emailStatus: entry.email_status,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackReferral = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Referral code required' });
    }

    const { data: entry, error } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('referral_code', code.toUpperCase())
      .maybeSingle();

    if (error || !entry) {
      return res.json({ success: true, valid: false });
    }

    return res.json({ success: true, valid: true, referrerId: entry.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data: entry } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (entry) {
      await supabase.from('waitlist_signups').update({
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString(),
        marketing_consent: false,
      }).eq('id', entry.id);
    }

    return res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminGetAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, role, country, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase.from('waitlist_signups').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status === 'verified') query = query.eq('email_verified', true);
    if (status === 'pending') query = query.eq('email_verified', false);
    if (role) query = query.eq('role', role);
    if (country) query = query.eq('country', country);

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminGetStats = async (req, res) => {
  try {
    const { count: total } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true });

    const { count: verified } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true })
      .eq('email_verified', true);

    const { count: pending } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true })
      .eq('email_verified', false);

    const { count: unsubscribed } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true })
      .eq('unsubscribed', true);

    // Role distribution
    const { data: roleData } = await supabase
      .from('waitlist_signups')
      .select('role');
    const roleCounts = {};
    (roleData || []).forEach(r => {
      const role = r.role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Country distribution
    const { data: countryData } = await supabase
      .from('waitlist_signups')
      .select('country');
    const countryCounts = {};
    (countryData || []).forEach(r => {
      const c = r.country || 'unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    // Interest distribution
    const { data: interestData } = await supabase
      .from('waitlist_signups')
      .select('interests');
    const interestCounts = {};
    (interestData || []).forEach(r => {
      if (Array.isArray(r.interests)) {
        r.interests.forEach(i => { interestCounts[i] = (interestCounts[i] || 0) + 1; });
      }
    });

    // Goal distribution
    const { data: goalData } = await supabase
      .from('waitlist_signups')
      .select('goal');
    const goalCounts = {};
    (goalData || []).forEach(r => {
      if (r.goal) goalCounts[r.goal] = (goalCounts[r.goal] || 0) + 1;
    });

    // Challenge distribution
    const { data: challengeData } = await supabase
      .from('waitlist_signups')
      .select('challenge');
    const challengeCounts = {};
    (challengeData || []).forEach(r => {
      if (r.challenge) challengeCounts[r.challenge] = (challengeCounts[r.challenge] || 0) + 1;
    });

    // Referral leaderboard
    const { data: referralData } = await supabase
      .from('waitlist_signups')
      .select('name, referral_count')
      .not('referral_count', 'eq', 0)
      .order('referral_count', { ascending: false })
      .limit(20);

    // Email stats
    const { count: emailsSent } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true });

    const { count: emailsOpened } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('opened', true);

    const { count: emailsClicked } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true);

    const { data: bounceData } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'bounced');

    return res.json({
      success: true,
      data: {
        total: total || 0,
        verified: verified || 0,
        pending: pending || 0,
        unsubscribed: unsubscribed || 0,
        verificationRate: total > 0 ? Math.round((verified || 0) / total * 100) : 0,
        roles: roleCounts,
        countries: countryCounts,
        interests: interestCounts,
        goals: goalCounts,
        challenges: challengeCounts,
        referralLeaderboard: referralData || [],
        email: {
          sent: emailsSent || 0,
          opened: emailsOpened || 0,
          clicked: emailsClicked || 0,
          openRate: emailsSent > 0 ? Math.round((emailsOpened || 0) / emailsSent * 100) : 0,
          clickRate: emailsSent > 0 ? Math.round((emailsClicked || 0) / emailsSent * 100) : 0,
          bounced: bounceData?.length || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminExport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('waitlist_signups')
      .select('name, email, username, country, profession, role, interests, goal, challenge, referral_code, referral_count, email_verified, email_status, marketing_consent, created_at, joined_date')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const csvHeaders = 'Name,Email,Username,Country,Profession,Role,Interests,Goal,Challenge,ReferralCode,Referrals,Verified,EmailStatus,MarketingConsent,CreatedAt,JoinedDate\n';
    const csvRows = (data || []).map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.username || ''}"`,
      `"${r.country || ''}"`,
      `"${r.profession || ''}"`,
      `"${r.role || ''}"`,
      `"${(Array.isArray(r.interests) ? r.interests.join('; ') : '')}"`,
      `"${r.goal || ''}"`,
      `"${r.challenge || ''}"`,
      `"${r.referral_code || ''}"`,
      r.referral_count || 0,
      r.email_verified ? 'Yes' : 'No',
      r.email_status || '',
      r.marketing_consent ? 'Yes' : 'No',
      r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
      r.joined_date ? new Date(r.joined_date).toISOString().split('T')[0] : '',
    ].join(','));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=waitlist-export.csv');
    return res.send(csvHeaders + csvRows.join('\n'));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminSendEmail = async (req, res) => {
  try {
    const { type, email: specificEmail } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, message: 'Email type is required' });
    }

    let query = supabase.from('waitlist_signups').select('email, name, role, referral_code').eq('email_verified', true).eq('unsubscribed', false);
    if (specificEmail) query = query.eq('email', specificEmail);

    const { data: recipients, error } = await query;
    if (error) throw error;

    const emailMap = {
      behind_the_scenes: { send: emailService.sendBehindTheScenesEmail, type: 'behind_scenes' },
      feature_preview: { send: emailService.sendFeaturePreviewEmail, type: 'feature_preview' },
      launch_countdown: { send: emailService.sendLaunchCountdownEmail, type: 'launch_countdown' },
    };

    const emailFn = emailMap[type];
    if (!emailFn) {
      return res.status(400).json({ success: false, message: 'Invalid email type' });
    }

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients || []) {
      try {
        let msgId;
        if (type === 'launch_countdown') {
          msgId = await emailFn.send(recipient.email, recipient.name, 90);
        } else {
          msgId = await emailFn.send(recipient.email, recipient.name);
        }
        if (msgId) {
          sent++;
          await supabase.from('email_logs').insert([{
            waitlist_id: recipient.id,
            email_type: emailFn.type,
            recipient_email: recipient.email,
            subject: 'Automated waitlist email',
            message_id: msgId,
            status: 'sent',
          }]).maybeSingle();
          await supabase.from('waitlist_signups').update({
            email_status: emailFn.type + '_sent',
            last_email_sent: new Date().toISOString(),
            last_email_type: emailFn.type,
          }).eq('email', recipient.email);
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        await supabase.from('email_logs').insert([{
          waitlist_id: recipient.id,
          email_type: emailFn.type,
          recipient_email: recipient.email,
          status: 'failed',
          error: err.message,
        }]).maybeSingle();
      }
    }

    return res.json({ success: true, sent, failed, total: recipients?.length || 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

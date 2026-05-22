const { supabase } = require('../config/supabase');

const getUserProfile = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No user data found in token' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[PROFILE_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

const login = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ success: false, error: 'No user data found in token' });
  }

  const { email, name, picture } = req.user || {};
  const { fullName: bodyName } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    let userData;

    if (!existingUser) {
      userData = {
        id: uid,
        email: email || null,
        full_name: bodyName || name || 'New Innovator',
        picture: picture || null,
        role: 'contestant',
        current_mode: 'contestant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').insert(userData);
      if (error) throw error;
    } else {
      userData = existingUser;
      const updates = { updated_at: new Date().toISOString() };
      if (email && !userData.email) updates.email = email;
      if (picture && !userData.picture) updates.picture = picture;

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', uid);
      if (error) throw error;

      userData = { ...userData, ...updates };
    }

    res.json({
      status: 'success',
      message: 'Logged in successfully',
      data: userData,
    });
  } catch (error) {
    console.error(`[LOGIN_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to synchronize user data with Arena' });
  }
};

const syncUserProfile = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No user data found in token' });
  }

  const { fullName, dob, nationality, country, city, phone, idType, idNumber, role, profession, bio, id_document_url, onboarding_complete, identity_document_url, address_document_url } = req.body;

  try {
    const profileData = {};
    if (fullName !== undefined) profileData.full_name = fullName;
    if (dob !== undefined) profileData.dob = dob;
    if (nationality !== undefined) profileData.nationality = nationality;
    if (country !== undefined) profileData.country = country;
    if (city !== undefined) profileData.city = city;
    if (idNumber !== undefined) profileData.id_number = idNumber;
    if (profession !== undefined) profileData.profession = profession;
    if (bio !== undefined) profileData.bio = bio;
    if (role !== undefined) profileData.role = role;
    if (id_document_url !== undefined) profileData.id_document_url = id_document_url;
    if (onboarding_complete !== undefined) profileData.onboarding_complete = onboarding_complete;
    if (identity_document_url !== undefined) profileData.identity_document_url = identity_document_url;
    if (address_document_url !== undefined) profileData.address_document_url = address_document_url;
    profileData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', uid);

    if (error) throw error;

    res.json({ status: 'success', message: 'Profile updated successfully', data: profileData });
  } catch (error) {
    console.error(`[SYNC_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to update profile data' });
  }
};

const updateMode = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { current_mode } = req.body;

  if (!current_mode || !['contestant', 'voter'].includes(current_mode)) {
    return res.status(400).json({ success: false, error: 'Mode must be "contestant" or "voter"' });
  }

  try {
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', uid)
      .eq('status', 'pending')
      .limit(1);

    if (pendingPayments && pendingPayments.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot switch modes while a payment is pending. Complete or cancel your pending payment first.',
      });
    }

    const { error } = await supabase
      .from('users')
      .update({ current_mode, updated_at: new Date().toISOString() })
      .eq('id', uid);

    if (error) throw error;

    res.json({ status: 'success', message: `Mode switched to ${current_mode}`, data: { current_mode } });
  } catch (error) {
    console.error(`[MODE_SWITCH_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to switch mode' });
  }
};

const getUserProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, picture, role')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[PUBLIC_PROFILE_ERROR] ID: ${id}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { getUserProfile, getUserProfileById, syncUserProfile, login, updateMode };

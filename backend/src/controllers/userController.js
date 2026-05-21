const { supabase } = require('../config/supabase');
const { ADMIN_EMAILS } = require('../middleware/authMiddleware');

const getUserProfile = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No user data found in token' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[PROFILE_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch profile' });
  }
};

const login = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ status: 'error', message: 'No user data found in token' });
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
      const isAdmin = ADMIN_EMAILS.includes(email);
      userData = {
        id: uid,
        email: email || null,
        full_name: bodyName || name || 'New Innovator',
        picture: picture || null,
        role: isAdmin ? 'admin' : 'contestant',
        is_verified: isAdmin,
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
    res.status(500).json({ status: 'error', message: 'Failed to synchronize user data with Arena' });
  }
};

const syncUserProfile = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No user data found in token' });
  }

  const { fullName, dob, nationality, phone, idType, idNumber, role, profession, bio } = req.body;

  try {
    const profileData = {};
    if (fullName !== undefined) profileData.full_name = fullName;
    if (dob !== undefined) profileData.dob = dob;
    if (nationality !== undefined) profileData.nationality = nationality;
    if (idNumber !== undefined) profileData.id_number = idNumber;
    if (profession !== undefined) profileData.profession = profession;
    if (bio !== undefined) profileData.bio = bio;
    if (role !== undefined) profileData.role = role;
    profileData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', uid);

    if (error) throw error;

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: profileData,
    });
  } catch (error) {
    console.error(`[SYNC_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile data' });
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
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[PUBLIC_PROFILE_ERROR] ID: ${id}:`, error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = { getUserProfile, getUserProfileById, syncUserProfile, login };

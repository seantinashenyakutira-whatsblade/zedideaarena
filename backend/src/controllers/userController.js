const { db } = require('../config/firebase');

/**
 * Get User Profile from Firestore
 */
const getUserProfile = async (req, res) => {
  const { uid } = req.user;

  if (!db) {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Database service unavailable (Firestore not initialized)' 
    });
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // If profile doesn't exist yet, we might want to return a specific status 
      // so the frontend can redirect to "Complete Profile"
      return res.status(404).json({ 
        status: 'error', 
        message: 'Profile not found' 
      });
    }

    res.json({ 
      status: 'success', 
      data: userDoc.data() 
    });
  } catch (error) {
    console.error(`[PROFILE_ERROR] UID: ${uid}:`, error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch profile' 
    });
  }
};

/**
 * Login / Sync User with Firestore
 * This is the primary entry point after Firebase Auth
 */
const login = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'No user data found in token' });
  }

  const { uid, email, name, picture } = req.user;
  const { fullName: bodyName } = req.body;

  try {
    if (!db) throw new Error('Firestore not initialized');

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData;

    if (!userDoc.exists) {
      // Create new user if they don't exist
      userData = {
        uid,
        email: email || null,
        fullName: bodyName || name || 'New Innovator',
        picture: picture || null,
        role: 'contestant', 
        kyc_status: 'unverified',
        is_verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await userRef.set(userData);
      console.log(`[AUTH] New user created: ${uid} (${email || 'no-email'})`);
    } else {
      userData = userDoc.data();
      // Sync basic info if it changed
      const updates = {
        updatedAt: new Date().toISOString()
      };
      if (email && !userData.email) updates.email = email;
      if (picture && !userData.picture) updates.picture = picture;
      
      await userRef.update(updates);
      userData = { ...userData, ...updates };
      console.log(`[AUTH] User logged in: ${uid}`);
    }

    res.json({
      status: 'success',
      message: 'Logged in successfully',
      data: userData
    });
  } catch (error) {
    console.error(`[LOGIN_ERROR] UID: ${uid}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to synchronize user data with Arena'
    });
  }
};

/**
 * Sync or Create User Profile with ID Validation
 */
const syncUserProfile = async (req, res) => {
  const { uid } = req.user;
  const { 
    fullName, 
    dob, 
    nationality, 
    phone, 
    idType, 
    idNumber,
    role
  } = req.body;

  try {
    if (!db) throw new Error('Firestore not initialized');

    const userRef = db.collection('users').doc(uid);
    const profileData = {
      fullName: fullName || null,
      dob: dob || null,
      nationality: nationality || null,
      phone: phone || null,
      idType: idType || null,
      idNumber: idNumber || null,
      role: role || null,
      updatedAt: new Date().toISOString()
    };

    // Remove nulls to avoid overwriting existing data with nulls if not provided
    Object.keys(profileData).forEach(key => profileData[key] === null && delete profileData[key]);

    await userRef.set(profileData, { merge: true });

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error(`[SYNC_ERROR] UID: ${uid}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile data'
    });
  }
};

/**
 * Get User Profile by ID (Public)
 */
const getUserProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const data = userDoc.data();
    res.json({
      status: 'success',
      data: {
        uid: id,
        fullName: data.fullName,
        picture: data.picture,
        role: data.role
      }
    });
  } catch (error) {
    console.error(`[PUBLIC_PROFILE_ERROR] ID: ${id}:`, error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  getUserProfileById,
  syncUserProfile,
  login
};

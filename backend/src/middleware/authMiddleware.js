const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID Token
 * Expected Header: Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized: No token provided' 
    });
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided'
    });
  }

  if (!auth) {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Authentication service unavailable (Firebase keys missing). Ensure FIREBASE_SERVICE_ACCOUNT_JSON is set on your host (e.g. Render) or FIREBASE_SERVICE_ACCOUNT_PATH is valid.' 
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken || null;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized: Invalid token' 
    });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const { db } = require('../config/firebase');
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (userDoc.exists && userDoc.data().role === 'admin') {
      return next();
    }
    
    res.status(403).json({ status: 'error', message: 'Forbidden: Admin access required' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = { verifyToken, isAdmin };

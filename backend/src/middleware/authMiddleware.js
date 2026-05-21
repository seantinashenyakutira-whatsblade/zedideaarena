const { supabase } = require('../config/supabase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token',
      });
    }

    req.user = {
      uid: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      picture: user.user_metadata?.avatar_url || null,
    };

    next();
  } catch (err) {
    console.error('Error verifying Supabase token:', err);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token',
    });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data: userRow, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', req.user.uid)
      .single();

    if (error || !userRow || !userRow.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { verifyToken, isAdmin };

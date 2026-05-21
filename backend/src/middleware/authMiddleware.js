const { supabase } = require('../config/supabase');

const ADMIN_EMAILS = [
  'dybrahimovic28@gmail.com',
  'seantinashenyakutira@gmail.com',
  'chenaichapto@gmail.com',
];

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided',
    });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid token',
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
      status: 'error',
      message: 'Unauthorized: Invalid token',
    });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const { data: userRow, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.uid)
      .single();

    if (error || !userRow || userRow.role !== 'admin') {
      return res
        .status(403)
        .json({ status: 'error', message: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = { verifyToken, isAdmin, ADMIN_EMAILS };

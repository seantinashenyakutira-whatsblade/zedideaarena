const { sendNotification } = require('../services/oneSignalService');
const { supabase } = require('../config/supabase');

const CATEGORY_MAP = {
  idea_approved: { title: 'Idea Status Update', link: '/dashboard/ideas' },
  verification: { title: 'Verification Update', link: '/dashboard/settings' },
  payments: { title: 'Payment', link: '/dashboard/payments' },
  arena_engagement: { title: 'Arena Activity', link: '/arena' },
  reports: { title: 'Report Update', link: null },
  new_competitions: { title: 'New Competition', link: '/competitions' },
  messages: { title: 'New Message', link: '/dashboard/messages' },
  admin_new_ideas: { title: 'New Idea Submitted', link: '/dashboard/admin/ideas' },
  admin_arena_engagement: { title: 'Arena Engagement', link: '/dashboard/admin' },
  admin_messages: { title: 'Support Message', link: '/dashboard/admin/messages' },
  admin_payments: { title: 'Payment Alert', link: '/dashboard/admin/payments' },
  admin_new_users: { title: 'New User', link: '/dashboard/admin/users' },
  admin_reports: { title: 'New Report', link: '/dashboard/admin/reports' },
  admin_withdrawals: { title: 'Withdrawal Request', link: '/dashboard/admin/withdrawals' },
};

function inferFallbackTitle(category) {
  return CATEGORY_MAP[category]?.title || 'Notification';
}

function inferFallbackLink(category) {
  return CATEGORY_MAP[category]?.link || '/dashboard';
}

async function getUserPreferences(userId) {
  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  } catch {
    return null;
  }
}

async function getAdminUserIds() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true);
    return (data || []).map(u => u.id);
  } catch {
    return [];
  }
}

async function insertAndPush({ user_id, type, category, title, message, link, priority = 'low' }) {
  const effectiveTitle = title || inferFallbackTitle(category) || type;
  const effectiveLink = link || inferFallbackLink(category);

  const { error } = await supabase.from('notifications').insert({
    user_id,
    type: type || category || 'system',
    category: category || null,
    priority,
    title: effectiveTitle,
    message: message || null,
    link: effectiveLink || null,
  });
  if (error) console.error('DB notification insert error:', error);

  const prefs = await getUserPreferences(user_id);
  if (prefs && prefs.push_enabled === false) return;

  if (prefs && category && prefs.categories?.[category]) {
    const catPrefs = prefs.categories[category];
    if (catPrefs.push === false) return;
  }

  try {
    await sendNotification({
      title: effectiveTitle,
      content: message || effectiveTitle,
      url: effectiveLink ? `${process.env.FRONTEND_URL}${effectiveLink}` : process.env.FRONTEND_URL,
      userIds: [user_id],
      priority,
      category,
    });
  } catch (err) {
    console.error('OneSignal push error:', err);
  }
}

async function insertAndPushAdmin({ type, category, title, message, link, priority = 'low' }) {
  const adminIds = await getAdminUserIds();
  if (adminIds.length === 0) return;

  const effectiveTitle = title || inferFallbackTitle(category) || type;
  const effectiveLink = link || inferFallbackLink(category);

  for (const adminId of adminIds) {
    const { error } = await supabase.from('notifications').insert({
      user_id: adminId,
      type: type || category || 'system',
      category: category || null,
      priority,
      title: effectiveTitle,
      message: message || null,
      link: effectiveLink || null,
    });
    if (error) console.error('DB notification insert error:', error);
  }

  prefsLoop: for (const adminId of adminIds) {
    const prefs = await getUserPreferences(adminId);
    if (prefs && prefs.push_enabled === false) continue;

    if (prefs && category && prefs.categories?.[category]) {
      const catPrefs = prefs.categories[category];
      if (catPrefs.push === false) continue;
    }

    try {
      await sendNotification({
        title: effectiveTitle,
        content: message || effectiveTitle,
        url: effectiveLink ? `${process.env.FRONTEND_URL}${effectiveLink}` : process.env.FRONTEND_URL,
        userIds: [adminId],
        priority,
        category,
      });
    } catch (err) {
      console.error('OneSignal push error:', err);
    }
  }
}

// --- Existing notification endpoints ---

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ status: 'success', data: data || [] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .is('is_read', false);
    if (error) throw error;
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- Trigger endpoints (called from frontend or other controllers) ---

const sendLikeNotification = async (req, res) => {
  try {
    const { postId } = req.body;
    const likerName = req.user.name || 'Someone';
    if (!postId) {
      return res.status(400).json({ status: 'error', message: 'Missing postId' });
    }

    const { data: post } = await supabase.from('arena_posts').select('content, user_id').eq('id', postId).single();
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });

    const snippet = post?.content ? (post.content.length > 80 ? post.content.slice(0, 80) + '...' : post.content) : 'your post';

    await insertAndPush({
      user_id: post.user_id,
      type: 'like',
      category: 'arena_engagement',
      title: `${likerName} liked your post`,
      message: snippet,
      link: '/arena',
      priority: 'low',
    });

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Like notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendCommentNotification = async (req, res) => {
  try {
    const { postId, commentContent } = req.body;
    const commenterName = req.user.name || 'Someone';
    if (!postId) {
      return res.status(400).json({ status: 'error', message: 'Missing postId' });
    }

    const { data: post } = await supabase.from('arena_posts').select('content, user_id').eq('id', postId).single();
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });

    const snippet = commentContent ? (commentContent.length > 80 ? commentContent.slice(0, 80) + '...' : commentContent) : '';

    await insertAndPush({
      user_id: post.user_id,
      type: 'comment',
      category: 'arena_engagement',
      title: `${commenterName} commented on your post`,
      message: snippet || 'view the comment',
      link: '/arena',
      priority: 'low',
    });

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Comment notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendChatNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const senderName = req.user.name || 'Someone';
    if (!userId || !message) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    await insertAndPush({
      user_id: userId,
      type: 'chat',
      category: 'messages',
      title: `New message${senderName ? ` from ${senderName}` : ''}`,
      message: message.length > 100 ? message.slice(0, 100) + '...' : message,
      link: '/dashboard/messages',
      priority: 'high',
    });

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Chat notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendBroadcast = async (req, res) => {
  try {
    const { title, content, url, segments, priority = 'low', category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ status: 'error', message: 'Title and content required' });
    }

    const result = await sendNotification({
      title,
      content,
      url: url || `${process.env.FRONTEND_URL}/arena`,
      segments: segments || ['All'],
      priority,
      category,
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyCompetitionUpdate = async (req, res) => {
  try {
    const { competitionTitle, userIds } = req.body;

    const result = await sendNotification({
      title: 'Competition Update',
      content: `New activity in "${competitionTitle || 'a competition'}" — check it out!`,
      url: `${process.env.FRONTEND_URL}/competitions`,
      userIds: userIds || undefined,
      segments: !userIds?.length ? ['All'] : undefined,
      priority: 'low',
      category: 'new_competitions',
    });

    if (userIds?.length) {
      for (const uid of userIds) {
        await insertAndPush({
          user_id: uid,
          type: 'competition',
          category: 'new_competitions',
          title: 'Competition Update',
          message: `New activity in "${competitionTitle || 'a competition'}"`,
          link: '/competitions',
          priority: 'low',
        });
      }
    }

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Competition notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyNewIdeas = async (req, res) => {
  try {
    const { count, userIds } = req.body;
    const ideaCount = count || 15;

    const result = await sendNotification({
      title: `${ideaCount}+ New Ideas Submitted!`,
      content: `Innovators have submitted ${ideaCount} new ideas. See what's new in the Arena.`,
      url: `${process.env.FRONTEND_URL}/arena`,
      userIds: userIds || undefined,
      segments: !userIds?.length ? ['All'] : undefined,
      priority: 'low',
      category: 'admin_new_ideas',
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('New ideas notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- New admin notification triggers ---

const notifyAdminNewIdea = async (req, res) => {
  try {
    const { ideaTitle, userId } = req.body;
    await insertAndPushAdmin({
      type: 'new_idea',
      category: 'admin_new_ideas',
      title: 'New Idea Submitted',
      message: `A new idea "${ideaTitle || 'Untitled'}" has been submitted by a user.`,
      link: '/dashboard/admin/ideas',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyAdminNewUser = async (req, res) => {
  try {
    const { userName, userEmail } = req.body;
    await insertAndPushAdmin({
      type: 'new_user',
      category: 'admin_new_users',
      title: 'New User Registered',
      message: `${userName || 'A new user'} (${userEmail || 'no email'}) just joined the Arena.`,
      link: '/dashboard/admin/users',
      priority: 'low',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyAdminNewPayment = async (req, res) => {
  try {
    const { amount, userName } = req.body;
    await insertAndPushAdmin({
      type: 'payment',
      category: 'admin_payments',
      title: 'Payment Received',
      message: `${userName || 'A user'} made a payment of $${(amount / 100).toFixed(2) || 'an amount'}.`,
      link: '/dashboard/admin/payments',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyAdminNewReport = async (req, res) => {
  try {
    const { targetType, reason } = req.body;
    await insertAndPushAdmin({
      type: 'report',
      category: 'admin_reports',
      title: 'New Report Submitted',
      message: `A ${targetType || 'content'} was reported for: ${reason || 'unspecified reason'}.`,
      link: '/dashboard/admin/reports',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyAdminWithdrawal = async (req, res) => {
  try {
    const { amount, userName } = req.body;
    await insertAndPushAdmin({
      type: 'withdrawal',
      category: 'admin_withdrawals',
      title: 'Withdrawal Request',
      message: `${userName || 'A user'} requested a withdrawal of $${(amount / 100).toFixed(2) || 'an amount'}.`,
      link: '/dashboard/admin/withdrawals',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserVerification = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const isApproved = status === 'approved';
    await insertAndPush({
      user_id: userId,
      type: 'verification',
      category: 'verification',
      title: isApproved ? 'Verification Approved' : 'Verification Update',
      message: isApproved ? 'Your identity has been verified. You can now access all Arena features.' : `Your verification status has been updated to: ${status}.`,
      link: '/dashboard/settings',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserIdeaStatus = async (req, res) => {
  try {
    const { userId, ideaTitle, status, note } = req.body;
    const isApproved = status === 'approved';
    await insertAndPush({
      user_id: userId,
      type: 'idea_status',
      category: 'idea_approved',
      title: isApproved ? 'Idea Approved!' : 'Idea Update',
      message: isApproved
        ? `Your idea "${ideaTitle || 'Untitled'}" has been approved! Check your dashboard for next steps.`
        : `Your idea "${ideaTitle || 'Untitled'}" was ${status}.${note ? ` Reason: ${note}` : ''}`,
      link: '/dashboard/ideas',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserPayment = async (req, res) => {
  try {
    const { userId, amount, purpose } = req.body;
    await insertAndPush({
      user_id: userId,
      type: 'payment',
      category: 'payments',
      title: 'Payment Received',
      message: `Your payment of $${(amount / 100).toFixed(2)} for ${purpose || 'a transaction'} was successful.`,
      link: '/dashboard/payments',
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserReportUpdate = async (req, res) => {
  try {
    const { userId, reportType, status } = req.body;
    await insertAndPush({
      user_id: userId,
      type: 'report',
      category: 'reports',
      title: 'Report Update',
      message: `Your report regarding a ${reportType || 'item'} has been ${status || 'reviewed'}.`,
      link: null,
      priority: 'high',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserNewCompetition = async (req, res) => {
  try {
    const { userId, competitionTitle } = req.body;
    await insertAndPush({
      user_id: userId,
      type: 'competition',
      category: 'new_competitions',
      title: 'New Competition!',
      message: `A new competition "${competitionTitle || 'Untitled'}" is now open. Submit your idea!`,
      link: '/competitions',
      priority: 'low',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const notifyUserArenaEngagement = async (req, res) => {
  try {
    const { userId, type: engagementType, detail } = req.body;
    const labels = { like: 'liked your post', comment: 'commented on your post', repost: 'reposted your post', follow: 'followed you' };
    const label = labels[engagementType] || 'engaged with your content';
    await insertAndPush({
      user_id: userId,
      type: engagementType || 'engagement',
      category: 'arena_engagement',
      title: 'Arena Activity',
      message: detail || `Someone ${label}.`,
      link: '/arena',
      priority: 'low',
    });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- Inline notification for controllers to call directly ---

async function notifyNewIdeaInline(ideaTitle, userId) {
  await insertAndPushAdmin({
    type: 'new_idea',
    category: 'admin_new_ideas',
    title: 'New Idea Submitted',
    message: `A new idea "${ideaTitle || 'Untitled'}" has been submitted.`,
    link: '/dashboard/admin/ideas',
    priority: 'high',
  });
}

async function notifyNewUserInline(userName, userEmail) {
  await insertAndPushAdmin({
    type: 'new_user',
    category: 'admin_new_users',
    title: 'New User Registered',
    message: `${userName || 'A new user'} (${userEmail || 'no email'}) just joined.`,
    link: '/dashboard/admin/users',
    priority: 'low',
  });
}

async function notifyPaymentInline(userId, amount, purpose) {
  await insertAndPush({
    user_id: userId,
    type: 'payment',
    category: 'payments',
    title: 'Payment Received',
    message: `Your payment of $${(amount / 100).toFixed(2)} for ${purpose || 'a transaction'} was successful.`,
    link: '/dashboard/payments',
    priority: 'high',
  });

  await insertAndPushAdmin({
    type: 'payment',
    category: 'admin_payments',
    title: 'Payment Received',
    message: `A payment of $${(amount / 100).toFixed(2)} was received.`,
    link: '/dashboard/admin/payments',
    priority: 'high',
  });
}

async function notifyReportInline(targetType, reason) {
  await insertAndPushAdmin({
    type: 'report',
    category: 'admin_reports',
    title: 'New Report Submitted',
    message: `A ${targetType || 'content'} was reported for: ${reason || 'unspecified reason'}.`,
    link: '/dashboard/admin/reports',
    priority: 'high',
  });
}

async function notifyWithdrawalInline(userName, amount) {
  await insertAndPushAdmin({
    type: 'withdrawal',
    category: 'admin_withdrawals',
    title: 'Withdrawal Request',
    message: `${userName || 'A user'} requested a withdrawal of $${(amount / 100).toFixed(2) || 'an amount'}.`,
    link: '/dashboard/admin/withdrawals',
    priority: 'high',
  });
}

async function notifyIdeaStatusInline(userId, ideaTitle, status, note) {
  const isApproved = status === 'approved';
  await insertAndPush({
    user_id: userId,
    type: 'idea_status',
    category: 'idea_approved',
    title: isApproved ? 'Idea Approved!' : 'Idea Update',
    message: isApproved
      ? `Your idea "${ideaTitle || 'Untitled'}" has been approved!`
      : `Your idea "${ideaTitle || 'Untitled'}" was ${status}.${note ? ` Reason: ${note}` : ''}`,
    link: '/dashboard/ideas',
    priority: 'high',
  });
}

async function notifyUserVerificationInline(userId, status) {
  const isApproved = status === 'approved';
  await insertAndPush({
    user_id: userId,
    type: 'verification',
    category: 'verification',
    title: isApproved ? 'Verification Approved' : 'Verification Update',
    message: isApproved ? 'Your identity has been verified.' : `Verification status: ${status}.`,
    link: '/dashboard/settings',
    priority: 'high',
  });
}

module.exports = {
  sendLikeNotification,
  sendCommentNotification,
  sendChatNotification,
  sendBroadcast,
  notifyCompetitionUpdate,
  notifyNewIdeas,
  notifyAdminNewIdea,
  notifyAdminNewUser,
  notifyAdminNewPayment,
  notifyAdminNewReport,
  notifyAdminWithdrawal,
  notifyUserVerification,
  notifyUserIdeaStatus,
  notifyUserPayment,
  notifyUserReportUpdate,
  notifyUserNewCompetition,
  notifyUserArenaEngagement,
  getNotifications,
  markRead,
  markAllRead,
  // Inline helpers for other controllers
  notifyNewIdeaInline,
  notifyNewUserInline,
  notifyPaymentInline,
  notifyReportInline,
  notifyWithdrawalInline,
  notifyIdeaStatusInline,
  notifyUserVerificationInline,
};

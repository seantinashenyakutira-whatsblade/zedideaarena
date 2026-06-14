const { sendNotification } = require('../services/oneSignalService');
const { supabase } = require('../config/supabase');

const insertNotification = async ({ user_id, type, title, message, link }) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id, type, title, message: message || null, link: link || null,
    });
    if (error) console.error('DB notification insert error:', error);
  } catch (err) {
    console.error('DB notification insert error:', err);
  }
};

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

const sendLikeNotification = async (req, res) => {
  try {
    const { postId, postOwnerId, likerName } = req.body;
    if (!postOwnerId || !likerName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const { data: post } = await supabase.from('arena_posts').select('content').eq('id', postId).single();
    const snippet = post?.content ? (post.content.length > 80 ? post.content.slice(0, 80) + '...' : post.content) : 'your post';

    const result = await sendNotification({
      title: `${likerName} liked your post`,
      content: snippet,
      url: `${process.env.FRONTEND_URL}/arena`,
      userIds: [postOwnerId],
    });

    await insertNotification({
      user_id: postOwnerId,
      type: 'like',
      title: `${likerName} liked your post`,
      message: snippet,
      link: '/arena',
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Like notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendCommentNotification = async (req, res) => {
  try {
    const { postId, postOwnerId, commenterName, commentContent } = req.body;
    if (!postOwnerId || !commenterName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const snippet = commentContent ? (commentContent.length > 80 ? commentContent.slice(0, 80) + '...' : commentContent) : '';

    const result = await sendNotification({
      title: `${commenterName} commented on your post`,
      content: snippet || 'view the comment',
      url: `${process.env.FRONTEND_URL}/arena`,
      userIds: [postOwnerId],
    });

    await insertNotification({
      user_id: postOwnerId,
      type: 'comment',
      title: `${commenterName} commented on your post`,
      message: snippet || 'view the comment',
      link: '/arena',
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Comment notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendChatNotification = async (req, res) => {
  try {
    const { userId, message, senderName } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const result = await sendNotification({
      title: `New message${senderName ? ` from ${senderName}` : ''}`,
      content: message.length > 100 ? message.slice(0, 100) + '...' : message,
      url: `${process.env.FRONTEND_URL}/arena`,
      userIds: [userId],
    });

    await insertNotification({
      user_id: userId,
      type: 'chat',
      title: `New message${senderName ? ` from ${senderName}` : ''}`,
      message: message.length > 100 ? message.slice(0, 100) + '...' : message,
      link: '/dashboard/messages',
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Chat notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendBroadcast = async (req, res) => {
  try {
    const { title, content, url, segments } = req.body;
    if (!title || !content) {
      return res.status(400).json({ status: 'error', message: 'Title and content required' });
    }

    const result = await sendNotification({
      title,
      content,
      url: url || `${process.env.FRONTEND_URL}/arena`,
      segments: segments || ['All'],
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
    });

    if (userIds?.length) {
      for (const uid of userIds) {
        await insertNotification({
          user_id: uid,
          type: 'competition',
          title: 'Competition Update',
          message: `New activity in "${competitionTitle || 'a competition'}"`,
          link: '/competitions',
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
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('New ideas notification error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  sendLikeNotification,
  sendCommentNotification,
  sendChatNotification,
  sendBroadcast,
  notifyCompetitionUpdate,
  notifyNewIdeas,
  getNotifications,
  markRead,
  markAllRead,
};

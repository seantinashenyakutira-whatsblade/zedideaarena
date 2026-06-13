const { sendNotification } = require('../services/oneSignalService');
const { supabase } = require('../config/supabase');

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
};

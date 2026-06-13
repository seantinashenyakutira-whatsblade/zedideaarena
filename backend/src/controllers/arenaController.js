const { supabase } = require('../config/supabase');

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;
    const viewerId = req.user?.uid || null;

    const { data: posts, error } = await supabase
      .from('arena_posts')
      .select(`
        *,
        users!inner(full_name, picture, role),
        linked_idea:linked_idea_id(id, title, industry),
        linked_competition:linked_competition_id(id, title),
        repost:repost_of_id(
          id, content, image_url, video_url, link_url, link_preview,
          created_at,
          users!inner(full_name, picture, role)
        ),
        arena_likes!left(user_id)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count } = await supabase
      .from('arena_posts')
      .select('id', { count: 'exact', head: true });

    const result = (posts || []).map(post => ({
      ...post,
      is_liked_by_viewer: viewerId
        ? (post.arena_likes || []).some(l => l.user_id === viewerId)
        : false,
      arena_likes: undefined,
    }));

    res.json({
      status: 'success',
      data: result,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('Get arena posts error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createPost = async (req, res) => {
  try {
    const {
      content, post_type,
      linked_idea_id, linked_competition_id,
      image_url, images, video_url, link_url, link_preview, topics,
    } = req.body;
    const userId = req.user.uid;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ status: 'error', message: 'Content too long (max 1000)' });
    }

    const validTypes = ['discussion', 'question', 'announcement', 'idea_highlight', 'media'];
    const type = validTypes.includes(post_type) ? post_type : 'discussion';

    const { data: post, error } = await supabase
      .from('arena_posts')
      .insert({
        user_id: userId,
        content: content.trim(),
        post_type: type,
        linked_idea_id: linked_idea_id || null,
        linked_competition_id: linked_competition_id || null,
        image_url: image_url || null,
        images: images || [],
        video_url: video_url || null,
        link_url: link_url || null,
        link_preview: link_preview || null,
        topics: topics || [],
      })
      .select(`
        *,
        users!inner(full_name, picture, role)
      `)
      .single();

    if (error) throw error;

    res.json({ status: 'success', data: post });
  } catch (err) {
    console.error('Create arena post error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createRepost = async (req, res) => {
  try {
    const { post_id, content } = req.body;
    const userId = req.user.uid;

    if (!post_id) {
      return res.status(400).json({ status: 'error', message: 'post_id is required' });
    }

    // Verify original post exists
    const { data: original, error: origError } = await supabase
      .from('arena_posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (origError || !original) {
      return res.status(404).json({ status: 'error', message: 'Original post not found' });
    }

    const repostContent = (content || '').trim().slice(0, 500);

    const { data: repost, error } = await supabase
      .from('arena_posts')
      .insert({
        user_id: userId,
        content: repostContent,
        post_type: 'discussion',
        repost_of_id: post_id,
      })
      .select(`
        *,
        users!inner(full_name, picture, role),
        repost:repost_of_id(
          id, content, image_url, video_url, link_url, link_preview,
          created_at,
          users!inner(full_name, picture, role)
        )
      `)
      .single();

    if (error) throw error;

    // Increment shares_count on original
    const { data: origPost } = await supabase
      .from('arena_posts')
      .select('shares_count')
      .eq('id', post_id)
      .single();

    await supabase
      .from('arena_posts')
      .update({ shares_count: (origPost?.shares_count || 0) + 1 })
      .eq('id', post_id);

    res.json({ status: 'success', data: repost });
  } catch (err) {
    console.error('Create repost error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const { data: existing } = await supabase
      .from('arena_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('arena_likes')
        .delete()
        .eq('id', existing.id);

      const { data: post } = await supabase
        .from('arena_posts')
        .select('likes_count')
        .eq('id', id)
        .single();

      await supabase
        .from('arena_posts')
        .update({ likes_count: Math.max(0, (post?.likes_count || 0) - 1) })
        .eq('id', id);

      return res.json({ status: 'success', liked: false });
    }

    await supabase
      .from('arena_likes')
      .insert({ post_id: id, user_id: userId });

    const { data: post } = await supabase
      .from('arena_posts')
      .select('likes_count')
      .eq('id', id)
      .single();

    await supabase
      .from('arena_posts')
      .update({ likes_count: (post?.likes_count || 0) + 1 })
      .eq('id', id);

    res.json({ status: 'success', liked: true });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: comments, error } = await supabase
      .from('arena_comments')
      .select(`
        *,
        users!inner(full_name, picture, role)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ status: 'success', data: comments || [] });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.uid;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Comment content is required' });
    }
    if (content.length > 300) {
      return res.status(400).json({ status: 'error', message: 'Comment too long (max 300)' });
    }

    const { data: comment, error } = await supabase
      .from('arena_comments')
      .insert({
        post_id: id,
        user_id: userId,
        content: content.trim(),
      })
      .select(`
        *,
        users!inner(full_name, picture, role)
      `)
      .single();

    if (error) throw error;

    const { data: post } = await supabase
      .from('arena_posts')
      .select('comments_count')
      .eq('id', id)
      .single();

    await supabase
      .from('arena_posts')
      .update({ comments_count: (post?.comments_count || 0) + 1 })
      .eq('id', id);

    res.json({ status: 'success', data: comment });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const trackShare = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post } = await supabase
      .from('arena_posts')
      .select('shares_count')
      .eq('id', id)
      .single();

    await supabase
      .from('arena_posts')
      .update({ shares_count: (post?.shares_count || 0) + 1 })
      .eq('id', id);

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Track share error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const trackAdImpression = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const { ad_unit, duration_seconds } = req.body;

    await supabase
      .from('ad_impressions')
      .insert({ user_id, ad_unit, duration_seconds });

    if (duration_seconds >= 3) {
      const credit_cents = 1;
      const { data: existing } = await supabase
        .from('voter_earnings')
        .select('ad_amount_cents')
        .eq('voter_id', user_id)
        .is('competition_id', null)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('voter_earnings')
          .update({ ad_amount_cents: (existing.ad_amount_cents || 0) + credit_cents })
          .eq('voter_id', user_id)
          .is('competition_id', null);
      } else {
        await supabase
          .from('voter_earnings')
          .insert({ voter_id: user_id, competition_id: null, ad_amount_cents: credit_cents });
      }
    }

    res.json({ tracked: true });
  } catch (err) {
    console.error('Track ad impression error:', err);
    res.status(500).json({ error: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { content, post_type, image_url, images, video_url, link_url, link_preview, topics } = req.body;

    const { data: existing } = await supabase
      .from('arena_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ status: 'error', message: 'Post not found' });
    if (existing.user_id !== userId) return res.status(403).json({ status: 'error', message: 'Not your post' });

    const updates = {};
    if (content !== undefined) updates.content = content.trim();
    if (post_type !== undefined) updates.post_type = post_type;
    if (image_url !== undefined) updates.image_url = image_url;
    if (images !== undefined) updates.images = images;
    if (video_url !== undefined) updates.video_url = video_url;
    if (link_url !== undefined) updates.link_url = link_url;
    if (link_preview !== undefined) updates.link_preview = link_preview;
    if (topics !== undefined) updates.topics = topics;

    const { data: post, error } = await supabase
      .from('arena_posts')
      .update(updates)
      .eq('id', id)
      .select(`*, users!inner(full_name, picture, role)`)
      .single();

    if (error) throw error;
    res.json({ status: 'success', data: post });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const { data: existing } = await supabase
      .from('arena_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ status: 'error', message: 'Post not found' });
    if (existing.user_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    await supabase.from('arena_posts').delete().eq('id', id);
    res.json({ status: 'success', message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getTrendingTopics = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('arena_posts')
      .select('topics')
      .not('topics', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const topicCount = {};
    (data || []).forEach(post => {
      (post.topics || []).forEach(topic => {
        const t = topic.toLowerCase().trim();
        if (t) topicCount[t] = (topicCount[t] || 0) + 1;
      });
    });

    const trending = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([topic, count]) => ({ topic, count }));

    res.json({ status: 'success', data: trending });
  } catch (err) {
    console.error('Trending topics error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getPostsByTopic = async (req, res) => {
  try {
    const topic = req.query.topic;
    if (!topic) return res.status(400).json({ status: 'error', message: 'topic query param required' });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;
    const viewerId = req.user?.uid || null;

    const { data: posts, error } = await supabase
      .from('arena_posts')
      .select(`
        *,
        users!inner(full_name, picture, role),
        arena_likes!left(user_id)
      `)
      .contains('topics', [topic])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const result = (posts || []).map(post => ({
      ...post,
      is_liked_by_viewer: viewerId
        ? (post.arena_likes || []).some(l => l.user_id === viewerId)
        : false,
      arena_likes: undefined,
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Posts by topic error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    const isAdmin = req.user.is_admin;
    const { conversation_id, before, limit = 50 } = req.query;

    let query = supabase
      .from('arena_chat_messages')
      .select(`*, users!inner(full_name, picture, role)`)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (conversation_id) {
      query = query.eq('conversation_id', conversation_id);
    }

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (conversation_id) {
      // Return flat messages array for a conversation
      const messages = (data || []).reverse();
      return res.json({ status: 'success', data: messages });
    }

    // Group by conversation for inbox view
    const conversations = {};
    (data || []).forEach(msg => {
      const convId = msg.conversation_id;
      if (!conversations[convId]) {
        conversations[convId] = {
          conversation_id: convId,
          user_id: msg.user_id,
          user_name: msg.users?.full_name || 'Unknown',
          user_picture: msg.users?.picture || null,
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread: !msg.read_at && msg.is_admin_reply !== true,
          messages: [],
        };
      }
      conversations[convId].messages.unshift(msg);
    });

    res.json({ status: 'success', data: Object.values(conversations) });
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { message, conversation_id, file_url, file_type, file_name, file_size } = req.body;

    if (!message?.trim() && !file_url) {
      return res.status(400).json({ status: 'error', message: 'Message or file is required' });
    }

    const insert = {
      user_id: userId,
      message: message?.trim() || '',
      conversation_id: conversation_id || undefined,
    };
    if (file_url) insert.file_url = file_url;
    if (file_type) insert.file_type = file_type;
    if (file_name) insert.file_name = file_name;
    if (file_size) insert.file_size = parseInt(file_size);

    const { data, error } = await supabase
      .from('arena_chat_messages')
      .insert(insert)
      .select(`*, users!inner(full_name, picture, role)`)
      .single();

    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (err) {
    console.error('Send chat error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const adminChatReply = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.user.uid;
    const { message, file_url, file_type, file_name, file_size } = req.body;

    if (!message?.trim() && !file_url) {
      return res.status(400).json({ status: 'error', message: 'Message or file is required' });
    }

    // Find the original user for this conversation
    const { data: original } = await supabase
      .from('arena_chat_messages')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    const insert = {
      conversation_id: conversationId,
      user_id: original?.user_id || adminId,
      admin_id: adminId,
      message: message?.trim() || '',
      is_admin_reply: true,
    };
    if (file_url) insert.file_url = file_url;
    if (file_type) insert.file_type = file_type;
    if (file_name) insert.file_name = file_name;
    if (file_size) insert.file_size = parseInt(file_size);

    const { data, error } = await supabase
      .from('arena_chat_messages')
      .insert(insert)
      .select(`*, users!inner(full_name, picture, role)`)
      .single();

    if (error) throw error;

    // Send push notification to the user
    try {
      const { sendNotification } = require('../services/oneSignalService');
      await sendNotification({
        title: 'New support reply',
        content: message?.trim()?.slice(0, 100) || 'Sent you a file',
        url: `${process.env.FRONTEND_URL || 'https://zedideaarena.com'}/arena`,
        userIds: [original?.user_id],
      });
    } catch {}

    res.json({ status: 'success', data });
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const userId = req.user.uid;
    const file = req.file;
    const ext = file.originalname.split('.').pop() || 'bin';
    const fileName = `chat/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('arena-media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('arena-media')
      .getPublicUrl(fileName);

    // Determine file type category
    let fileType = 'document';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype.startsWith('audio/')) fileType = 'audio';

    res.json({
      status: 'success',
      data: {
        file_url: urlData.publicUrl,
        file_type: fileType,
        file_name: file.originalname,
        file_size: file.size,
      },
    });
  } catch (err) {
    console.error('Upload chat file error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uid;

    const { error } = await supabase
      .from('arena_chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('is_admin_reply', false)
      .is('read_at', null);

    if (error) throw error;
    res.json({ status: 'success' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getRules = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('arena_rules')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ status: 'success', data: data || [] });
  } catch (err) {
    console.error('Get rules error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, picture, role, bio, created_at, social_links')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { data: posts, error: postsError } = await supabase
      .from('arena_posts')
      .select(`*, users!inner(full_name, picture, role)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) throw postsError;

    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('id, title, industry, description, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (ideasError) throw ideasError;

    res.json({
      status: 'success',
      data: { profile, posts: posts || [], ideas: ideas || [] },
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getPosts, createPost, updatePost, deletePost, createRepost,
  toggleLike, getComments, addComment, trackShare, trackAdImpression,
  getTrendingTopics, getPostsByTopic,
  getChatMessages, sendChatMessage, adminChatReply,
  uploadChatFile, markConversationRead,
  getRules, getUserProfile,
};

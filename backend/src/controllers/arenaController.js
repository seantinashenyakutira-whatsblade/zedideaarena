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
      image_url, video_url, link_url, link_preview,
    } = req.body;
    const userId = req.user.uid;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Content is required' });
    }
    if (content.length > 500) {
      return res.status(400).json({ status: 'error', message: 'Content too long (max 500)' });
    }

    const validTypes = ['discussion', 'question', 'announcement', 'idea_highlight'];
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
        video_url: video_url || null,
        link_url: link_url || null,
        link_preview: link_preview || null,
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
      await supabase
        .from('voter_earnings')
        .upsert({
          voter_id: user_id,
          competition_id: null,
          ad_amount_cents: credit_cents,
        }, {
          onConflict: 'voter_id,competition_id',
          ignoreDuplicates: false,
        });
    }

    res.json({ tracked: true });
  } catch (err) {
    console.error('Track ad impression error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPosts, createPost, createRepost, toggleLike, getComments, addComment, trackShare, trackAdImpression };

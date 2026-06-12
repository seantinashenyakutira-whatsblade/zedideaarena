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
    const { content, post_type, linked_idea_id, linked_competition_id } = req.body;
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

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Check if already liked
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

    // Like
    await supabase
      .from('arena_likes')
      .insert({ post_id: id, user_id: userId });

    // Increment likes_count using raw update
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

    // Increment comments_count
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

const trackAdImpression = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const { ad_unit, duration_seconds } = req.body;

    const { data } = await supabase
      .from('ad_impressions')
      .insert({ user_id, ad_unit, duration_seconds })
      .select().single();

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

module.exports = { getPosts, createPost, toggleLike, getComments, addComment, trackAdImpression };

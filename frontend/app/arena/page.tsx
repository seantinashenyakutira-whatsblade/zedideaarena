'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { AdUnit } from '@/components/ads/AdUnit'
import { toast } from 'sonner'
import {
  MessageCircle, Heart, Share2, Send, Pin, Trophy,
  Users, TrendingUp, Clock, Sparkles, Loader2,
  Hash, Search, ChevronDown, X, Eye
} from 'lucide-react'

type PostType = 'discussion' | 'question' | 'announcement' | 'idea_highlight'

interface ArenaPost {
  id: string
  user_id: string
  content: string
  post_type: PostType
  linked_idea_id: string | null
  linked_competition_id: string | null
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  is_liked_by_viewer: boolean
  users: { full_name: string; picture: string | null; role: string }
  linked_idea?: { id: string; title: string; industry: string } | null
  linked_competition?: { id: string; title: string } | null
}

const POST_TYPE_OPTIONS: { value: PostType; label: string; icon: string }[] = [
  { value: 'discussion', label: 'Discussion', icon: '💬' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'announcement', label: 'Announcement', icon: '📢' },
  { value: 'idea_highlight', label: 'Idea Highlight', icon: '💡' },
]

const POST_TYPE_BADGES: Record<PostType, { label: string; color: string }> = {
  discussion: { label: 'Discussion', color: 'bg-blue-500/20 text-blue-400' },
  question: { label: 'Question', color: 'bg-amber-500/20 text-amber-400' },
  announcement: { label: 'Announcement', color: 'bg-purple-500/20 text-purple-400' },
  idea_highlight: { label: 'Idea Highlight', color: 'bg-emerald-500/20 text-emerald-400' },
}

function timeAgo(date: string): string {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(date).toLocaleDateString()
}

export default function ArenaPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<ArenaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostType, setNewPostType] = useState<PostType>('discussion')
  const [submitting, setSubmitting] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const res: any = await api.get('/arena/posts?limit=50')
      setPosts(res?.data || [])
    } catch (err) {
      console.error('Failed to load arena posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCreatePost = async () => {
    if (!profile) {
      router.push('/auth/login')
      return
    }
    const content = newPostContent.trim()
    if (!content) return
    setSubmitting(true)
    try {
      await api.post('/arena/posts', {
        content,
        post_type: newPostType,
      })
      setNewPostContent('')
      setNewPostType('discussion')
      setShowTypeSelector(false)
      toast.success('Post created!')
      fetchPosts()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!profile) { router.push('/auth/login'); return }
    try {
      const res: any = await api.post(`/arena/posts/${postId}/like`)
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              is_liked_by_viewer: res.liked,
              likes_count: res.liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
            }
          : p
      ))
    } catch {}
  }

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => { const n = new Set(prev); n.delete(postId); return n })
      return
    }
    setExpandedComments(prev => new Set(prev).add(postId))
    if (!comments[postId]) {
      try {
        const res: any = await api.get(`/arena/posts/${postId}/comments`)
        setComments(prev => ({ ...prev, [postId]: res?.data || [] }))
      } catch {}
    }
  }

  const handleComment = async (postId: string) => {
    if (!profile) { router.push('/auth/login'); return }
    const text = (commentText[postId] || '').trim()
    if (!text) return
    setSubmittingComment(postId)
    try {
      const res: any = await api.post(`/arena/posts/${postId}/comments`, { content: text })
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }))
      setCommentText(prev => ({ ...prev, [postId]: '' }))
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ))
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(null)
    }
  }

  const handleShare = async (post: ArenaPost) => {
    const url = `${window.location.origin}/arena?post=${post.id}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Arena Post', text: post.content, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied!')
      } catch {}
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-icon.png" alt="" width={24} height={24} className="object-contain" />
              <span className="font-black text-sm tracking-tight gradient-text">The Arena</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/competitions" className="text-xs font-bold text-white/50 hover:text-white transition-colors">Competitions</Link>
            <Link href="/how-it-works" className="text-xs font-bold text-white/50 hover:text-white transition-colors">How It Works</Link>
            {profile ? (
              <Link href="/dashboard" className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500 text-white">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Feed */}
          <div ref={feedRef}>
            {/* Create Post */}
            <div className="glass-card p-4 mb-6">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile?.picture ? (
                    <Image src={profile.picture} alt="" width={36} height={36} className="object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-indigo-400">
                      {profile?.fullName?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder={profile ? "Share your thoughts on the current competition..." : "Sign in to join the discussion..."}
                    maxLength={500}
                    rows={2}
                    className="w-full bg-transparent text-sm text-white placeholder-zinc-500 resize-none focus:outline-none"
                    onClick={() => !profile && router.push('/auth/login')}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => profile ? setShowTypeSelector(!showTypeSelector) : router.push('/auth/login')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {POST_TYPE_OPTIONS.find(t => t.value === newPostType)?.icon}{' '}
                          {POST_TYPE_OPTIONS.find(t => t.value === newPostType)?.label}
                          <ChevronDown size={12} />
                        </button>
                        {showTypeSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 z-20 min-w-[160px] shadow-xl">
                            {POST_TYPE_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => { setNewPostType(opt.value); setShowTypeSelector(false) }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                  newPostType === opt.value ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <span>{opt.icon}</span> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{newPostContent.length}/500</span>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || submitting || !profile}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all"
                    >
                      {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-zinc-800 rounded w-1/4" />
                        <div className="h-3 bg-zinc-800 rounded w-3/4" />
                        <div className="h-3 bg-zinc-800 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl">🏟️</span>
                <h3 className="text-lg font-bold mt-4 mb-2">The Arena is quiet...</h3>
                <p className="text-sm text-zinc-400">Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {posts.map((post, i) => {
                    const badge = POST_TYPE_BADGES[post.post_type] || POST_TYPE_BADGES.discussion
                    const isLiked = post.is_liked_by_viewer
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`glass-card p-4 transition-all duration-200 ${
                          post.is_pinned ? 'border-indigo-500/30' : ''
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {post.users?.picture ? (
                              <Image src={post.users.picture} alt="" width={36} height={36} className="object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-indigo-400">
                                {post.users?.full_name?.[0] || '?'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{post.users?.full_name || 'Anonymous'}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                post.users?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                post.users?.role === 'voter' ? 'bg-cyan-500/20 text-cyan-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {post.users?.role?.toUpperCase() || 'USER'}
                              </span>
                              {post.is_pinned && <Pin size={12} className="text-indigo-400" />}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] text-zinc-500">{timeAgo(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                        {/* Linked idea/competition preview */}
                        {post.linked_idea && (
                          <Link href={`/pitch/${post.linked_idea.id}`}
                                className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                            <span className="text-sm">💡</span>
                            <div>
                              <p className="text-xs font-bold">{post.linked_idea.title}</p>
                              {post.linked_idea.industry && (
                                <p className="text-[9px] text-zinc-500">{post.linked_idea.industry}</p>
                              )}
                            </div>
                          </Link>
                        )}
                        {post.linked_competition && (
                          <Link href={`/competitions/${post.linked_competition.id}`}
                                className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                            <Trophy size={14} className="text-emerald-400" />
                            <div>
                              <p className="text-xs font-bold">{post.linked_competition.title}</p>
                              <p className="text-[9px] text-zinc-500">Competition</p>
                            </div>
                          </Link>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                              isLiked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'
                            }`}
                          >
                            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                            {post.likes_count || 0}
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-400 transition-all"
                          >
                            <MessageCircle size={14} />
                            {post.comments_count || 0}
                          </button>
                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition-all"
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedComments.has(post.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
                                {/* Existing comments */}
                                {(comments[post.id] || []).map((comment: any) => (
                                  <div key={comment.id} className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                      {comment.users?.picture ? (
                                        <Image src={comment.users.picture} alt="" width={24} height={24} className="object-cover" />
                                      ) : (
                                        <span className="text-[8px] font-bold text-zinc-400">
                                          {comment.users?.full_name?.[0] || '?'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold">{comment.users?.full_name || 'Anonymous'}</span>
                                        <span className="text-[8px] text-zinc-500">{timeAgo(comment.created_at)}</span>
                                      </div>
                                      <p className="text-xs text-zinc-300 mt-0.5">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Comment input */}
                                {profile && (
                                  <div className="flex gap-2">
                                    <input
                                      value={commentText[post.id] || ''}
                                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                                      placeholder="Add a comment..."
                                      maxLength={300}
                                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                      onClick={() => handleComment(post.id)}
                                      disabled={!commentText[post.id]?.trim() || submittingComment === post.id}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-bold disabled:opacity-30 hover:bg-indigo-600 transition-all"
                                    >
                                      {submittingComment === post.id ? <Loader2 size={12} className="animate-spin" /> : 'Send'}
                                    </button>
                                  </div>
                                )}
                                {!profile && (
                                  <p className="text-[10px] text-zinc-500 text-center">
                                    <Link href="/auth/login" className="text-indigo-400 hover:underline">Sign in</Link> to comment
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-indigo-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Trending</h3>
              </div>
              <div className="space-y-2">
                {['#IdeaToWin2026', '#Innovation', '#Funding', '#AI', '#ClimateTech'].map(tag => (
                  <button key={tag} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors w-full text-left">
                    <Hash size={12} className="text-zinc-600" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Snapshot */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-amber-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Top Voters</h3>
              </div>
              <p className="text-[10px] text-zinc-500">Leaderboard coming soon...</p>
            </div>

            {/* Arena Stats */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-cyan-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Arena Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-black text-white">{posts.length}</p>
                  <p className="text-[9px] text-zinc-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white">{posts.reduce((s, p) => s + p.comments_count, 0)}</p>
                  <p className="text-[9px] text-zinc-500">Comments</p>
                </div>
              </div>
            </div>

            {/* Ad */}
            <AdUnit
              slot="arena-sidebar"
              format="rectangle"
              className="sticky top-20"
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { AdUnit } from '@/components/ads/AdUnit'
import { toast } from 'sonner'
import {
  MessageCircle, Heart, Share2, Send, Pin, Trophy,
  Users, TrendingUp, Loader2, Sparkles,
  Hash, ChevronDown, ImageIcon, Video, Link2, Repeat2,
  X, Play, ExternalLink, Expand, MoreHorizontal, Edit3, Trash2, Plus, Flag,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePageChannel } from '@/hooks/usePageChannel'
import { ImageCarousel } from '@/components/arena/ImageCarousel'
import { TopicsSidebar } from '@/components/arena/TopicsSidebar'
import { ArenaChat } from '@/components/arena/ArenaChat'
import { ImageCropper } from '@/components/ImageCropper'
import ReportModal from '@/components/report/ReportModal'

type PostType = 'discussion' | 'question' | 'announcement' | 'idea_highlight' | 'media'

interface ArenaPost {
  id: string
  user_id: string
  content: string
  post_type: PostType
  linked_idea_id: string | null
  linked_competition_id: string | null
  image_url: string | null
  images: string[]
  video_url: string | null
  link_url: string | null
  link_preview: { title?: string; description?: string; image?: string } | null
  repost_of_id: string | null
  repost?: ArenaPost | null
  likes_count: number
  comments_count: number
  shares_count: number
  is_pinned: boolean
  created_at: string
  is_liked_by_viewer: boolean
  users: { full_name: string; picture: string | null; role: string }
  linked_idea?: { id: string; title: string; industry: string } | null
  linked_competition?: { id: string; title: string } | null
  topics: string[]
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
  media: { label: 'Media', color: 'bg-pink-500/20 text-pink-400' },
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

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

function PostMedia({ post }: { post: ArenaPost }) {
  const allImages = (post.images?.length ? post.images : post.image_url ? [post.image_url] : [])

  if (allImages.length > 0) {
    return <ImageCarousel images={allImages} />
  }

  if (post.video_url) {
    const youtubeId = getYouTubeId(post.video_url)
    if (youtubeId) {
      return (
        <div className="relative rounded-xl overflow-hidden mb-3 bg-black aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    return (
      <video
        src={post.video_url}
        controls
        className="w-full max-h-80 rounded-xl mb-3 bg-zinc-900"
        preload="metadata"
        playsInline
      />
    )
  }

  if (post.link_url) {
    const preview = post.link_preview
    return (
      <a
        href={post.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors mb-3 group"
      >
        {preview?.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
            <Image src={preview.image} alt="" width={64} height={64} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {preview?.title && <p className="text-sm font-bold text-white truncate">{preview.title}</p>}
          {preview?.description && <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{preview.description}</p>}
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <ExternalLink size={10} />
            {new URL(post.link_url).hostname}
          </p>
        </div>
      </a>
    )
  }

  return null
}

function RepostIndicator({ repost }: { repost: ArenaPost }) {
  return (
    <div className="mb-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <AvatarDisplay src={repost.users?.picture} name={repost.users?.full_name} size={20} />
          </div>
        <span className="text-[10px] font-bold text-zinc-400">{repost.users?.full_name || 'Anonymous'}</span>
        <span className="text-[8px] text-zinc-600">{timeAgo(repost.created_at)}</span>
      </div>
      {repost.content && <p className="text-xs text-zinc-300 mb-2">{repost.content}</p>}
      <PostMedia post={repost} />
    </div>
  )
}

function AvatarDisplay({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const [error, setError] = useState(false)
  if (src && !error) {
    return <img src={src} alt="" width={size} height={size} className="object-cover rounded-full" onError={() => setError(true)} />
  }
  return <span className="text-xs font-bold text-indigo-400">{name?.[0] || '?'}</span>
}

export default function ArenaPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<ArenaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostType, setNewPostType] = useState<PostType>('discussion')
  const [newPostImage, setNewPostImage] = useState<string | null>(null)
  const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null)
  const [newPostVideoUrl, setNewPostVideoUrl] = useState('')
  const [newPostLinkUrl, setNewPostLinkUrl] = useState('')
  const [showMediaBar, setShowMediaBar] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)
  const [reposting, setReposting] = useState<string | null>(null)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const multiFileInputRef = useRef<HTMLInputElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [cropIndex, setCropIndex] = useState(-1)

  // Online users presence
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [selectedCompId, setSelectedCompId] = useState<string>('')
  const [competitionList, setCompetitionList] = useState<any[]>([])

  // Fetch competitions for leaderboard dropdown
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res: any = await api.get('/competitions')
        const comps = (res?.data || []).filter((c: any) => !c.is_deleted)
        setCompetitionList(comps)
        if (comps.length > 0) {
          setSelectedCompId(comps[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch competitions:', err)
      }
    }
    fetchCompetitions()
  }, [])

  // Fetch leaderboard when competition changes
  useEffect(() => {
    if (!selectedCompId) return
    setLeaderboardLoading(true)
    const fetchLeaderboard = async () => {
      try {
        const res: any = await api.get(`/votes/${selectedCompId}/leaderboard`)
        setLeaderboard(res?.data || [])
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        setLeaderboard([])
      } finally {
        setLeaderboardLoading(false)
      }
    }
    fetchLeaderboard()
  }, [selectedCompId])

  // Presence for online users
  useEffect(() => {
    if (!profile?.id) return
    const presenceChannel = supabase.channel('arena-presence', {
      config: { presence: { key: profile.id } }
    })
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const users = Object.values(state).flat().map((p: any) => p)
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        setOnlineUsers(prev => [...prev.filter(u => !newPresences.some((p: any) => p.user_id === u.user_id)), ...newPresences])
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        setOnlineUsers(prev => prev.filter(u => !leftPresences.some((p: any) => p.user_id === u.user_id)))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: profile.id,
            name: profile.full_name,
            picture: profile.picture,
            online_at: new Date().toISOString()
          })
        }
      })
    return () => {
      presenceChannel.untrack()
      supabase.removeChannel(presenceChannel)
    }
  }, [profile?.id, profile?.full_name, profile?.picture])

  // Real-time: single channel for the entire arena feed
  usePageChannel('arena-feed', [
    // ── Broadcast from DB triggers ──
    { type: 'broadcast', event: 'like_update', handler: (payload: any) => {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload
      if (data.type === 'like_count' && data.post_id) {
        setPosts((prev: any[]) => prev.map(p =>
          p.id === data.post_id
            ? { ...p, likes_count: data.likes_count, is_liked_by_viewer: data.user_id === profile?.id ? true : p.is_liked_by_viewer }
            : p
        ))
      }
    }},
    { type: 'broadcast', event: 'comment_update', handler: (payload: any) => {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload
      if (data.type === 'comment_count' && data.post_id) {
        setPosts((prev: any[]) => prev.map(p =>
          p.id === data.post_id
            ? { ...p, comments_count: data.comments_count }
            : p
        ))
      }
    }},
    // ── Postgres Changes for full post sync ──
    { type: 'pg', event: 'INSERT', table: 'arena_posts', handler: async () => {
      try {
        const res: any = await api.get('/arena/posts?limit=50')
        setPosts(res?.data || [])
      } catch {}
    }},
    { type: 'pg', event: 'UPDATE', table: 'arena_posts', handler: (payload: any) => {
      setPosts((prev: any[]) => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
    }},
    { type: 'pg', event: 'DELETE', table: 'arena_posts', handler: (payload: any) => {
      setPosts((prev: any[]) => prev.filter(p => p.id !== payload.old.id))
    }},
  ], [profile?.id])

  const fetchPosts = useCallback(async (topic?: string | null) => {
    try {
      const url = topic ? `/arena/posts/by-topic?topic=${encodeURIComponent(topic)}` : '/arena/posts?limit=50'
      const res: any = await api.get(url)
      setPosts(res?.data || [])
    } catch (err) {
      console.error('Failed to load arena posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(activeTopic)
  }, [fetchPosts, activeTopic])

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (newImages.length + files.length > 6) {
      toast.error('Max 6 images per post')
      return
    }
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is too large (max 10MB)`); return false }
      return true
    })
    setNewImages(prev => [...prev, ...validFiles])
    setNewImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(newImagePreviews[idx])
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handlePostImageCrop = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob)
    URL.revokeObjectURL(newImagePreviews[cropIndex])
    setNewImages(prev => prev.map((f, i) => i === cropIndex ? new File([blob], f.name, { type: 'image/jpeg' }) : f))
    setNewImagePreviews(prev => prev.map((u, i) => i === cropIndex ? newUrl : u))
    setCropImage(null)
    setCropIndex(-1)
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of newImages) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res: any = await api.post('/media/arena-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res?.url) urls.push(res.url)
      } catch (err: any) {
        toast.error(err?.message || `Failed to upload ${file.name}`)
      }
    }
    return urls
  }

  const handleCreatePost = async () => {
    if (!profile) { router.push('/auth/login'); return }
    const content = newPostContent.trim()
    if (!content && newImages.length === 0 && !newPostVideoUrl && !newPostLinkUrl) return
    setSubmitting(true)
    try {
      const images = await uploadImages()
      const body: Record<string, any> = {
        content: content || '(media)',
        post_type: newPostType,
      }
      if (images.length > 0) {
        body.images = images
        body.image_url = images[0]
      }
      if (newPostVideoUrl.trim()) body.video_url = newPostVideoUrl.trim()
      if (newPostLinkUrl.trim()) body.link_url = newPostLinkUrl.trim()

      await api.post('/arena/posts', body)
      setNewPostContent('')
      setNewPostType('discussion')
      setNewImages([])
      setNewImagePreviews([])
      setNewPostVideoUrl('')
      setNewPostLinkUrl('')
      setShowMediaBar(false)
      toast.success('Post created!')
      fetchPosts(activeTopic)
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
          ? { ...p, is_liked_by_viewer: res.liked, likes_count: res.liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1) }
          : p
      ))
      if (res.liked) {
        const post = posts.find(p => p.id === postId)
        if (post && post.user_id !== profile.id) {
          api.post('/notifications/like', { postId, postOwnerId: post.user_id, likerName: profile.full_name }).catch(() => {})
        }
      }
    } catch {}
  }

  const handleRepost = async (postId: string) => {
    if (!profile) { router.push('/auth/login'); return }
    setReposting(postId)
    try {
      const res: any = await api.post('/arena/posts/repost', { post_id: postId })
      setPosts(prev => [res.data, ...prev])
      toast.success('Reposted!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to repost')
    } finally {
      setReposting(null)
    }
  }

  const handleShare = async (post: ArenaPost) => {
    const url = `${window.location.origin}/arena?post=${post.id}`
    try {
      await api.post(`/arena/posts/${post.id}/share`)
    } catch {}
    if (navigator.share) {
      try { await navigator.share({ title: 'Arena Post', text: post.content, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied!')
      } catch {}
    }
  }

  const handleEditPost = async (postId: string) => {
    if (!editContent.trim()) return
    try {
      await api.put(`/arena/posts/${postId}`, { content: editContent.trim() })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent.trim() } : p))
      setEditingPost(null)
      setEditContent('')
      toast.success('Post updated')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update post')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/arena/posts/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Post deleted')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete post')
    }
    setShowMenu(null)
  }

  const generateAIPost = async () => {
    if (!profile) { router.push('/auth/login'); return }
    setSubmitting(true)
    try {
      const names = ['Tech Innovators', 'Creative Thinkers', 'Idea Shapers', 'Future Builders', 'Arena Champions']
      const name = names[Math.floor(Math.random() * names.length)]
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            { role: 'system', content: `You are a community manager for an idea competition platform called "The Arena". Generate a short, engaging discussion prompt (max 200 chars) to spark conversation about innovation, startups, or competitions. Include 2-3 relevant hashtags.` },
            { role: 'user', content: `Generate a discussion prompt for ${name} in The Arena.` },
          ],
          max_tokens: 150,
        }),
      })
      const data = await res.json()
      const prompt = data?.choices?.[0]?.message?.content?.trim()
      if (prompt) {
        setNewPostContent(prompt)
        toast.success('AI prompt ready! Feel free to edit before posting.')
      }
    } catch {
      toast.error('Failed to generate AI prompt')
    } finally {
      setSubmitting(false)
    }
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
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
      setCommentText(prev => ({ ...prev, [postId]: '' }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))

      const post = posts.find(p => p.id === postId)
      if (post && post.user_id !== profile.id) {
        api.post('/notifications/comment', { postId, postOwnerId: post.user_id, commenterName: profile.full_name, commentContent: text }).catch(() => {})
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(null)
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
    <div className="flex h-screen bg-[#0A0A0F]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <input ref={multiFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
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
                    <span className="text-xs font-bold text-indigo-400">{profile?.fullName?.[0] || '?'}</span>
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

                  {/* Media previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-square group cursor-pointer" onClick={() => { setCropImage(preview); setCropIndex(idx) }}>
                          <Image src={preview} alt="" width={200} height={200} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="text-white/0 group-hover:text-white/70 text-[10px] font-bold transition-all">Crop</span>
                          </div>
                          <button onClick={e => { e.stopPropagation(); removeImage(idx) }} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Media bar */}
                  {showMediaBar && (
                    <div className="mt-2 space-y-2 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                      <div className="flex items-center gap-2">
                        <Link2 size={14} className="text-zinc-400" />
                        <input
                          value={newPostVideoUrl}
                          onChange={e => setNewPostVideoUrl(e.target.value)}
                          placeholder="YouTube video URL..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink size={14} className="text-zinc-400" />
                        <input
                          value={newPostLinkUrl}
                          onChange={e => setNewPostLinkUrl(e.target.value)}
                          placeholder="Link URL..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button
                          onClick={() => profile ? setShowTypeSelector(!showTypeSelector) : router.push('/auth/login')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {POST_TYPE_OPTIONS.find(t => t.value === newPostType)?.icon} {POST_TYPE_OPTIONS.find(t => t.value === newPostType)?.label}
                          <ChevronDown size={12} />
                        </button>
                        {showTypeSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 z-20 min-w-[160px] shadow-xl">
                            {POST_TYPE_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => { setNewPostType(opt.value); setShowTypeSelector(false) }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${newPostType === opt.value ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                              >
                                <span>{opt.icon}</span> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => profile ? multiFileInputRef.current?.click() : router.push('/auth/login')}
                        className={`p-1.5 rounded-lg transition-all ${newImages.length > 0 ? 'text-indigo-400 bg-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        title="Attach images (max 6)"
                      >
                        <ImageIcon size={14} />
                      </button>
                      <button
                        onClick={() => profile ? setShowMediaBar(!showMediaBar) : router.push('/auth/login')}
                        className={`p-1.5 rounded-lg transition-all ${showMediaBar || newPostVideoUrl || newPostLinkUrl ? 'text-indigo-400 bg-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        title="Add video or link"
                      >
                        <Link2 size={14} />
                      </button>
                      <button
                        onClick={generateAIPost}
                        disabled={submitting}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-white/5 transition-all"
                        title="Generate AI prompt"
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      </button>
                      <span className="text-[10px] text-zinc-500 ml-1">{newPostContent.length}/500</span>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={(!newPostContent.trim() && newImages.length === 0 && !newPostVideoUrl && !newPostLinkUrl) || submitting || !profile}
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Feed</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            </div>
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
                        className={`glass-card p-4 transition-all duration-200 ${post.is_pinned ? 'border-indigo-500/30' : ''}`}
                      >
                        {/* Repost indicator */}
                        {post.repost_of_id && (
                          <div className="flex items-center gap-1.5 mb-2 text-[10px] text-zinc-500 font-bold">
                            <Repeat2 size={12} className="text-emerald-400" />
                            Repost
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <Link href={`/arena/profile/${post.user_id}`}>
                            <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 ring-indigo-400/50 transition-all">
                              <AvatarDisplay src={post.users?.picture} name={post.users?.full_name} />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/arena/profile/${post.user_id}`} className="font-bold text-sm hover:text-indigo-400 transition-colors">
                                {post.users?.full_name || 'Anonymous'}
                              </Link>
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
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                              <span className="text-[10px] text-zinc-500">{timeAgo(post.created_at)}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <button onClick={() => setShowMenu(showMenu === post.id ? null : post.id)} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                              <MoreHorizontal size={14} />
                            </button>
                            {showMenu === post.id && (
                              <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 z-20 min-w-[140px] shadow-xl">
                                {profile?.id === post.user_id ? (
                                  <>
                                    <button
                                      onClick={() => { setEditingPost(post.id); setEditContent(post.content); setShowMenu(null) }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                      <Edit3 size={12} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeletePost(post.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                    >
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => { setReportTarget({ type: 'post', id: post.id }); setShowMenu(null) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                  >
                                    <Flag size={12} /> Report
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        {editingPost === post.id ? (
                          <div className="mb-3 space-y-2">
                            <textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              maxLength={500}
                              rows={3}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditPost(post.id)} className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-bold hover:bg-indigo-600 transition-all">Save</button>
                              <button onClick={() => { setEditingPost(null); setEditContent('') }} className="px-3 py-1 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          post.content !== '(media)' && (
                            <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
                          )
                        )}

                        {/* Topics */}
                        {post.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.topics.map(t => (
                              <button key={t} onClick={() => setActiveTopic(activeTopic === t ? null : t)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                  activeTopic === t
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                                }`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Reposted content */}
                        {post.repost && <RepostIndicator repost={post.repost} />}

                        {/* Media */}
                        <PostMedia post={post} />

                        {/* Linked idea/competition */}
                        {post.linked_idea && (
                          <Link href={`/pitch/${post.linked_idea.id}`}
                                className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                            <span className="text-sm">💡</span>
                            <div>
                              <p className="text-xs font-bold">{post.linked_idea.title}</p>
                              {post.linked_idea.industry && <p className="text-[9px] text-zinc-500">{post.linked_idea.industry}</p>}
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
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all ${isLiked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'}`}
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
                            onClick={() => handleRepost(post.id)}
                            disabled={reposting === post.id}
                            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-all"
                          >
                            <Repeat2 size={14} />
                            {post.shares_count || 0}
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
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
                                {(comments[post.id] || []).map((comment: any) => (
                                  <div key={comment.id} className="flex gap-2 group">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                      <AvatarDisplay src={comment.users?.picture} name={comment.users?.full_name} size={24} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold">{comment.users?.full_name || 'Anonymous'}</span>
                                        <span className="text-[8px] text-zinc-500">{timeAgo(comment.created_at)}</span>
                                      </div>
                                      <p className="text-xs text-zinc-300 mt-0.5">{comment.content}</p>
                                    </div>
                                    <button onClick={() => setReportTarget({ type: 'comment', id: comment.id })} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all self-start mt-1" title="Report comment">
                                      <Flag size={10} />
                                    </button>
                                  </div>
                                ))}
                                {profile ? (
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
                                ) : (
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
            <TopicsSidebar activeTopic={activeTopic} onSelectTopic={(t) => { setActiveTopic(t); setLoading(true) }} />

            {/* Online Users */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-green-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Online</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {onlineUsers.slice(0, 6).map((u: any, i: number) => (
                    <div key={u.user_id || i} className="w-7 h-7 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {u.picture ? (
                        <img src={u.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-green-400">{u.name?.[0] || '?'}</span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-green-400 ml-1">{onlineUsers.length} online</span>
              </div>
            </div>

            {/* Arena Stats */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-cyan-400" />
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
                <div className="text-center">
                  <p className="text-lg font-black text-white">{posts.reduce((s, p) => s + p.likes_count, 0)}</p>
                  <p className="text-[9px] text-zinc-500">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white">{onlineUsers.length}</p>
                  <p className="text-[9px] text-zinc-500">Online</p>
                </div>
              </div>

              {activeTopic && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-zinc-500 text-center">Filtered by: <span className="text-indigo-400 font-bold">#{activeTopic}</span></p>
                  <button onClick={() => { setActiveTopic(null); setLoading(true) }} className="mt-1 w-full text-[10px] text-indigo-400 hover:underline text-center">Clear filter</button>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Leaderboard</h3>
                </div>
              </div>

              {/* Competition Selector */}
              <div className="relative mb-3">
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className="w-full text-[10px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 font-bold appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select Competition</option>
                  {competitionList.map((comp: any) => (
                    <option key={comp.id} value={comp.id}>{comp.title}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>

              {leaderboardLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-zinc-800/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !selectedCompId ? (
                <p className="text-[10px] text-zinc-500 text-center py-4">Select a competition above</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-[10px] text-zinc-500 text-center py-4">No ideas ranked yet</p>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.map((idea: any, i: number) => {
                    const rank = i + 1
                    const isTop3 = rank <= 3
                    const colors = ['text-yellow-400', 'text-zinc-300', 'text-amber-700']
                    const bgColors = ['bg-yellow-500/10 border-yellow-500/30', 'bg-zinc-300/10 border-zinc-300/20', 'bg-amber-700/10 border-amber-700/30']
                    const rankColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-700']
                    return (
                      <div
                        key={idea.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          isTop3
                            ? `${bgColors[i]} border`
                            : 'bg-zinc-800/30'
                        }`}
                      >
                        <span className={`w-5 text-center text-xs font-black ${isTop3 ? rankColors[i] : 'text-zinc-600'}`}>
                          {rank <= 3 ? ['🥇', '🥈', '🥉'][i] : `#${rank}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold truncate ${isTop3 ? 'text-white' : 'text-zinc-300'}`}>
                            {idea.title}
                          </p>
                          <p className="text-[9px] text-zinc-500 truncate">{idea.contestant_name}</p>
                        </div>
                        <span className={`text-xs font-black ${isTop3 ? 'text-amber-400' : 'text-zinc-400'}`}>
                          {idea.vote_count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <AdUnit slot="arena-sidebar" format="rectangle" className="sticky top-20" />
          </aside>
        </div>
      </div>
        </main>
      </div>
      <ArenaChat />
      <ReportModal targetType={reportTarget?.type || 'post'} targetId={reportTarget?.id || ''} open={!!reportTarget} onClose={() => setReportTarget(null)} />
      {cropImage && (
        <ImageCropper src={cropImage} aspect={1} onCrop={handlePostImageCrop} onCancel={() => { setCropImage(null); setCropIndex(-1) }} />
      )}
    </div>
  )
}

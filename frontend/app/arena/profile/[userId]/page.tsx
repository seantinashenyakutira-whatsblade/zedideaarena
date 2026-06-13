'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'
import ReportModal from '@/components/report/ReportModal'
import {
  ArrowLeft, Calendar, MessageCircle, Heart, Lightbulb, Trophy,
  Grid3X3, Bookmark, Loader2, X, ChevronLeft, ChevronRight, Check, Edit3, Flag,
} from 'lucide-react'

type Tab = 'posts' | 'ideas'

const SOCIAL_PLATFORMS: Record<string, { icon: React.ReactNode; color: string }> = {
  twitter: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    color: 'text-white',
  },
  instagram: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    color: 'text-pink-400',
  },
  linkedin: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    color: 'text-blue-400',
  },
  github: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    color: 'text-white',
  },
  youtube: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    color: 'text-red-400',
  },
  tiktok: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    color: 'text-cyan-300',
  },
  facebook: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    color: 'text-blue-500',
  },
  whatsapp: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    color: 'text-green-400',
  },
  discord: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>,
    color: 'text-indigo-400',
  },
  website: {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    color: 'text-emerald-400',
  },
}

export default function ArenaProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { profile: myProfile } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingBio, setSavingBio] = useState(false)
  const [tab, setTab] = useState<Tab>('posts')
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  const isOwnProfile = myProfile?.id === userId

  useEffect(() => {
    if (!userId) return
    api.get(`/arena/profile/${userId}`).then((res: any) => {
      setData(res?.data || null)
      setBioText(res?.data?.profile?.bio || '')
    }).catch(() => {}).finally(() => setLoading(false))
  }, [userId])

  const saveBio = async () => {
    setSavingBio(true)
    try {
      await api.post('/user/profile', { bio: bioText })
      setData((prev: any) => prev ? { ...prev, profile: { ...prev.profile, bio: bioText } } : prev)
      setEditingBio(false)
      toast.success('Bio updated')
    } catch {
      toast.error('Failed to update bio')
    } finally {
      setSavingBio(false)
    }
  }

  const postsWithImages = (data?.posts || []).filter((p: any) => p.image_url || p.images?.length > 0)
  const postsTextOnly = (data?.posts || []).filter((p: any) => !p.image_url && (!p.images || p.images.length === 0))
  const socialLinks = data?.profile?.social_links || []

  const openPost = (post: any, idx: number) => {
    setSelectedPost(post)
    setSelectedIdx(idx)
  }

  const prevPost = () => {
    const allPosts = data?.posts || []
    const newIdx = (selectedIdx - 1 + allPosts.length) % allPosts.length
    setSelectedPost(allPosts[newIdx])
    setSelectedIdx(newIdx)
  }

  const nextPost = () => {
    const allPosts = data?.posts || []
    const newIdx = (selectedIdx + 1) % allPosts.length
    setSelectedPost(allPosts[newIdx])
    setSelectedIdx(newIdx)
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-white/50" size={24} />
    </div>
  )

  if (!data?.profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
      User not found
    </div>
  )

  const { profile, posts, ideas } = data

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4">

        {/* Back */}
        <div className="py-4 flex items-center justify-between">
          <Link href="/arena" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          {myProfile?.id !== profile.id && (
            <button onClick={() => setReportOpen(true)} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors">
              <Flag size={12} /> Report user
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="flex items-start gap-8 mb-8 pb-8 border-b border-white/10">
          <div className="w-[100px] h-[100px] shrink-0 rounded-full overflow-hidden border-2 border-white/10 bg-white/5">
            {profile.picture ? (
              <Image src={profile.picture} alt={profile.full_name} width={100} height={100} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/20">{profile.full_name?.[0]}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap mb-3">
              <h1 className="text-xl font-bold">{profile.full_name}</h1>
              {profile.role && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-zed-primary border border-zed-primary/30">
                  {profile.role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-8 mb-3">
              <div className="text-center">
                <p className="text-lg font-bold">{posts?.length || 0}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{ideas?.length || 0}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Ideas</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/40">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Joined</p>
              </div>
            </div>

            {/* Bio - editable inline for own profile */}
            <div className="max-w-lg">
              {editingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    maxLength={300}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-zed-primary/50"
                    placeholder="Tell us about yourself..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveBio}
                      disabled={savingBio}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zed-primary text-white text-[10px] font-bold hover:bg-zed-primary/80 transition-all disabled:opacity-50"
                    >
                      {savingBio ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingBio(false); setBioText(profile.bio || '') }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  {profile.bio ? (
                    <p className="text-sm text-white/60 leading-relaxed">{profile.bio}</p>
                  ) : (
                    <p className="text-sm text-white/20 italic">No bio yet</p>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditingBio(true)}
                      className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all shrink-0 mt-0.5"
                    >
                      <Edit3 size={12} className="text-white/40" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            {socialLinks.filter((s: any) => s.url).length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {socialLinks.filter((s: any) => s.url).map((link: any) => {
                  const platform = SOCIAL_PLATFORMS[link.platform] || { icon: '🔗', color: 'text-white' }
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all ${platform.color} text-sm`}
                      title={link.url}
                    >
                      {platform.icon}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-12 mb-6 border-b border-white/10">
          <button
            onClick={() => setTab('posts')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              tab === 'posts' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <Grid3X3 size={14} /> Posts
          </button>
          <button
            onClick={() => setTab('ideas')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              tab === 'ideas' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <Lightbulb size={14} /> Ideas
          </button>
        </div>

        {/* Posts Grid */}
        {tab === 'posts' && (
          <>
            {postsWithImages.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mb-1">
                {postsWithImages.map((post: any, idx: number) => {
                  const firstImg = post.images?.[0] || post.image_url
                  return (
                    <button
                      key={post.id}
                      onClick={() => openPost(post, data.posts.indexOf(post))}
                      className="aspect-square overflow-hidden bg-white/5 group relative"
                    >
                      <Image src={firstImg} alt="" width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
                          <Heart size={14} fill="white" /> {post.likes_count || 0}
                        </span>
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
                          <MessageCircle size={14} fill="white" /> {post.comments_count || 0}
                        </span>
                      </div>
                      {post.images?.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                          <Bookmark size={12} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {postsTextOnly.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-bold">Text Posts</p>
                {postsTextOnly.map((post: any) => (
                  <button
                    key={post.id}
                    onClick={() => openPost(post, data.posts.indexOf(post))}
                    className="w-full text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <p className="text-sm leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                      <span className="flex items-center gap-1"><Heart size={10} /> {post.likes_count || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.comments_count || 0}</span>
                      <span className="text-white/20">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(!posts || posts.length === 0) && (
              <div className="text-center py-20 text-white/20 text-sm">No posts yet</div>
            )}
          </>
        )}

        {/* Ideas Tab */}
        {tab === 'ideas' && (
          <div className="space-y-3">
            {(ideas || []).map((idea: any) => (
              <Link key={idea.id} href={`/pitch/${idea.id}`}
                className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-zed-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Lightbulb size={18} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold group-hover:text-zed-primary transition-colors">{idea.title}</h3>
                  {idea.industry && <p className="text-xs text-zed-primary/70 mt-0.5">{idea.industry}</p>}
                  {idea.description && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                    <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    {idea.status && (
                      <span className="px-2 py-0.5 rounded bg-white/5 uppercase tracking-wider font-bold">{idea.status}</span>
                    )}
                  </div>
                </div>
                <Trophy size={16} className="text-amber-400/50 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
              </Link>
            ))}
            {(!ideas || ideas.length === 0) && (
              <div className="text-center py-20 text-white/20 text-sm">No ideas submitted yet</div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <button className="absolute top-4 right-4 text-white/50 hover:text-white z-10"><X size={24} /></button>
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevPost} className="text-white/50 hover:text-white p-2"><ChevronLeft size={20} /></button>
              <span className="text-xs text-white/30">{selectedIdx + 1} / {(data?.posts || []).length}</span>
              <button onClick={nextPost} className="text-white/50 hover:text-white p-2"><ChevronRight size={20} /></button>
            </div>

            <div className="bg-zinc-900 rounded-2xl overflow-hidden">
              {(() => {
                const imgs = selectedPost.images?.length ? selectedPost.images : selectedPost.image_url ? [selectedPost.image_url] : []
                if (imgs.length > 0) return (
                  <div className="relative">
                    <ImageCarouselCustom images={imgs} />
                  </div>
                )
              })()}

              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                    {profile.picture ? (
                      <Image src={profile.picture} alt="" width={32} height={32} className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/30">{profile.full_name?.[0]}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{profile.full_name}</p>
                    <p className="text-[10px] text-white/30">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedPost.content !== '(media)' && (
                  <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{selectedPost.content}</p>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                  <span className="flex items-center gap-1.5 text-sm text-white/60">
                    <Heart size={16} /> {selectedPost.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/60">
                    <MessageCircle size={16} /> {selectedPost.comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ReportModal targetType="profile" targetId={profile.id} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}

function ImageCarouselCustom({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  if (images.length === 1) {
    return (
      <Image src={images[0]} alt="" width={600} height={600} className="w-full aspect-square object-cover" unoptimized />
    )
  }
  return (
    <div className="relative">
      <Image src={images[idx]} alt="" width={600} height={600} className="w-full aspect-square object-cover" unoptimized />
      <div className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-0.5 text-[10px] font-bold">{idx + 1}/{images.length}</div>
      {idx > 0 && (
        <button onClick={() => setIdx(idx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 rounded-full p-1.5 hover:bg-black/80"><ChevronLeft size={14} /></button>
      )}
      {idx < images.length - 1 && (
        <button onClick={() => setIdx(idx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 rounded-full p-1.5 hover:bg-black/80"><ChevronRight size={14} /></button>
      )}
    </div>
  )
}

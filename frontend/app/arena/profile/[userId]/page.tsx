'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'
import {
  ArrowLeft, Calendar, MessageCircle, Heart, Lightbulb, Trophy,
  Grid3X3, Bookmark, Loader2, X, ChevronLeft, ChevronRight, Check, Edit3,
} from 'lucide-react'

type Tab = 'posts' | 'ideas'

const SOCIAL_PLATFORMS: Record<string, { icon: string; color: string }> = {
  twitter: { icon: '𝕏', color: 'text-white' },
  instagram: { icon: '📸', color: 'text-pink-400' },
  linkedin: { icon: '💼', color: 'text-blue-400' },
  github: { icon: '⌘', color: 'text-white' },
  youtube: { icon: '▶', color: 'text-red-400' },
  tiktok: { icon: '♪', color: 'text-cyan-400' },
  facebook: { icon: 'f', color: 'text-blue-500' },
  whatsapp: { icon: '📱', color: 'text-green-400' },
  discord: { icon: '💬', color: 'text-indigo-400' },
  website: { icon: '🌐', color: 'text-emerald-400' },
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
        <div className="py-4">
          <Link href="/arena" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
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

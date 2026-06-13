'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MessageCircle, Heart, Lightbulb, Trophy } from 'lucide-react'
import api from '@/lib/api'
import { ImageCarousel } from '@/components/arena/ImageCarousel'

type Tab = 'posts' | 'ideas'

export default function ArenaProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('posts')

  useEffect(() => {
    if (!userId) return
    api.get(`/arena/profile/${userId}`).then((res: any) => {
      setData(res?.data || null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zed-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data?.profile) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white/50">
      User not found
    </div>
  )

  const { profile, posts, ideas } = data

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/arena" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Arena
        </Link>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 shrink-0">
            {profile.picture ? (
              <Image src={profile.picture} alt={profile.full_name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/30">{profile.full_name?.[0]}</div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
            {profile.role && <p className="text-sm text-zed-primary font-semibold">{profile.role}</p>}
            {profile.bio && <p className="text-sm text-white/50 mt-1">{profile.bio}</p>}
            <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
              <Calendar size={12} /> Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'posts' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            <MessageCircle size={14} />
            Posts ({posts?.length || 0})
          </button>
          <button
            onClick={() => setTab('ideas')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'ideas' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            <Lightbulb size={14} />
            Ideas ({ideas?.length || 0})
          </button>
        </div>

        {/* Posts Tab */}
        {tab === 'posts' && (
          <div className="space-y-4">
            {(posts || []).map((post: any) => (
              <div key={post.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.post_type && <span className="uppercase tracking-wider text-[10px] text-zed-primary/60">({post.post_type})</span>}
                </div>
                <p className="text-sm leading-relaxed">{post.content}</p>
                {post.images?.length > 0 && <ImageCarousel images={post.images} className="mt-3" />}
                {post.image_url && !post.images?.length && (
                  <Image src={post.image_url} alt="" width={600} height={400} className="mt-3 rounded-xl max-h-64 object-cover w-full" unoptimized />
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Heart size={12} /> {post.likes_count || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments_count || 0}</span>
                </div>
              </div>
            ))}
            {(!posts || posts.length === 0) && (
              <p className="text-center text-white/30 py-12 text-sm">No posts yet</p>
            )}
          </div>
        )}

        {/* Ideas Tab */}
        {tab === 'ideas' && (
          <div className="space-y-4">
            {(ideas || []).map((idea: any) => (
              <Link key={idea.id} href={`/pitch/${idea.id}`}
                className="block p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-zed-primary/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">{idea.title}</h3>
                    {idea.industry && <p className="text-xs text-zed-primary mt-0.5">{idea.industry}</p>}
                    {idea.description && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{idea.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                      {idea.status && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-wider">{idea.status}</span>
                      )}
                    </div>
                  </div>
                  <Trophy size={14} className="text-amber-400 shrink-0 mt-1" />
                </div>
              </Link>
            ))}
            {(!ideas || ideas.length === 0) && (
              <p className="text-center text-white/30 py-12 text-sm">No ideas submitted yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

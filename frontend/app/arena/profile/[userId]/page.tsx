'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MessageCircle, Heart, MapPin } from 'lucide-react'
import api from '@/lib/api'
import { ImageCarousel } from '@/components/arena/ImageCarousel'

export default function ArenaProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const { profile, posts } = data

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

        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Posts ({posts?.length || 0})</h2>

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
      </div>
    </div>
  )
}

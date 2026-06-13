'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface TopicsSidebarProps {
  activeTopic: string | null
  onSelectTopic: (topic: string | null) => void
}

export function TopicsSidebar({ activeTopic, onSelectTopic }: TopicsSidebarProps) {
  const [topics, setTopics] = useState<{ topic: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/arena/posts/trending-topics').then((res: any) => {
      setTopics(res?.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Trending Topics</h3>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />)}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-xs text-white/30">No topics yet</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {activeTopic && (
            <button onClick={() => onSelectTopic(null)}
              className="text-xs px-3 py-1.5 rounded-full bg-zed-primary/20 text-zed-primary font-semibold"
            >
              All Posts
            </button>
          )}
          {topics.map(t => (
            <button
              key={t.topic}
              onClick={() => onSelectTopic(activeTopic === t.topic ? null : t.topic)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeTopic === t.topic
                  ? 'bg-zed-primary/20 border-zed-primary/50 text-zed-primary font-semibold'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {t.topic}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

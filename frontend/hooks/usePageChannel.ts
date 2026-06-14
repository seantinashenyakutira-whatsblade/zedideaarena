'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── Postgres Changes subscription ──
export interface PGChangeSub {
  type: 'pg'
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  table: string
  filter?: string
  handler: (payload: any) => void
}

// ── Broadcast subscription ──
export interface BroadcastSub {
  type: 'broadcast'
  event: string
  handler: (payload: any) => void
}

type ChannelSub = PGChangeSub | BroadcastSub

/**
 * Single-channel hook: one supabase.channel per page combining
 * multiple postgres_changes + broadcast listeners.
 */
export function usePageChannel(
  channelName: string,
  subs: ChannelSub[],
  deps: any[] = [],
) {
  const subsRef = useRef(subs)
  subsRef.current = subs

  useEffect(() => {
    const channel = supabase.channel(channelName)

    for (const sub of subsRef.current) {
      if (sub.type === 'pg') {
        channel.on(
          'postgres_changes',
          { event: sub.event, schema: 'public', table: sub.table, filter: sub.filter },
          (payload) => sub.handler(payload),
        )
      } else if (sub.type === 'broadcast') {
        channel.on('broadcast', { event: sub.event }, (payload) => sub.handler(payload))
      }
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, ...deps])
}

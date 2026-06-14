'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'votes' | 'ideas' | 'arena_posts' | 'arena_likes' | 'arena_comments' | 'notifications' | 'users' | 'payments' | 'competitions'

interface UseRealtimeOptions {
  table: TableName
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  handler: (payload: RealtimePostgresChangesPayload<any>) => void
  onStatus?: (status: string) => void
}

export function useRealtime({ table, filter, event = '*', handler, onStatus }: UseRealtimeOptions) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const channelName = `${table}-${filter || 'all'}-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event, schema: 'public', table, filter },
        (payload) => handlerRef.current(payload)
      )
      .subscribe((status) => onStatus?.(status))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, event])
}

export function useRealtimeCallback<T extends Record<string, unknown>>(
  table: TableName,
  filter: string | undefined,
  cb: (payload: RealtimePostgresChangesPayload<T>) => void,
  deps: any[] = []
) {
  const savedCb = useRef(cb)
  savedCb.current = cb

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-${filter || 'all'}-${deps.join('-')}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload: RealtimePostgresChangesPayload<T>) => savedCb.current(payload)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, filter, ...deps])
}

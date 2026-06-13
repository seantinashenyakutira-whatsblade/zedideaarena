'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2, Image, Paperclip, FileText, Video, Music, ChevronDown, Check, WifiOff } from 'lucide-react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

type FileAttachment = {
  url: string
  type: 'image' | 'video' | 'document' | 'audio'
  name: string
  size: number
}

export function ArenaChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<FileAttachment | null>(null)
  const [uploading, setUploading] = useState(false)
  const [connected, setConnected] = useState(true)
  const { profile } = useAuth()
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) fetchMessages() }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase realtime subscription
  useEffect(() => {
    if (!open || !conversationId) return
    const sub = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'arena_chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))
    return () => { sub.unsubscribe() }
  }, [open, conversationId])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/arena/chat')
      const convs = res?.data || []
      if (convs.length > 0) {
        const latest = convs.sort((a: any, b: any) =>
          (b.last_message_at || b.messages?.[b.messages.length - 1]?.created_at) > (a.last_message_at || a.messages?.[a.messages.length - 1]?.created_at) ? 1 : -1
        )[0]
        setMessages(latest.messages || [])
        setConversationId(latest.conversation_id)
        // Mark as read
        api.post(`/arena/chat/${latest.conversation_id}/read`).catch(() => {})
      }
    } catch {} finally { setLoading(false) }
  }

  const polishWithAI = async () => {
    if (!input.trim()) return
    const raw = input.trim()
    setInput('Polishing...')
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            { role: 'system', content: 'Polish and improve the following message for clarity and professionalism. Keep it concise. Return only the polished message, no explanation.' },
            { role: 'user', content: raw },
          ],
          max_tokens: 200,
        }),
      })
      const data = await res.json()
      setInput(data?.choices?.[0]?.message?.content?.trim() || raw)
    } catch { setInput(raw) }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res: any = await api.post('/arena/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res?.data) {
        setAttachment(res.data)
      }
    } catch {} finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const sendMessage = async () => {
    if ((!input.trim() && !attachment) || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const payload: any = {
        message: text,
        conversation_id: conversationId || undefined,
      }
      if (attachment) {
        payload.file_url = attachment.url
        payload.file_type = attachment.type
        payload.file_name = attachment.name
        payload.file_size = attachment.size
      }
      const res: any = await api.post('/arena/chat', payload)
      if (res?.data) {
        setMessages(prev => [...prev, res.data])
        if (!conversationId) setConversationId(res.data.conversation_id)
        setAttachment(null)
      }
    } catch {} finally { setSending(false) }
  }

  const removeAttachment = () => setAttachment(null)

  const AttachmentPreview = () => {
    if (!attachment) return null
    return (
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10 mb-2">
        {attachment.type === 'image' && <Image size={16} className="text-green-400 shrink-0" />}
        {attachment.type === 'video' && <Video size={16} className="text-purple-400 shrink-0" />}
        {attachment.type === 'audio' && <Music size={16} className="text-blue-400 shrink-0" />}
        {attachment.type === 'document' && <FileText size={16} className="text-amber-400 shrink-0" />}
        <span className="text-xs truncate flex-1 text-white/70">{attachment.name}</span>
        <button onClick={removeAttachment} className="text-white/30 hover:text-white/70"><X size={14} /></button>
      </div>
    )
  }

  const FileMessage = ({ msg }: { msg: any }) => {
    if (!msg.file_url) return null
    const isImage = msg.file_type === 'image'
    const isVideo = msg.file_type === 'video'
    const isAudio = msg.file_type === 'audio'

    const [loaded, setLoaded] = useState(false)
    const imgRef = useRef<HTMLImageElement | null>(null)

    useEffect(() => {
      if (!isImage || !imgRef.current) return
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          const img = document.createElement('img')
          img.onload = () => setLoaded(true)
          img.src = msg.file_url
          obs.disconnect()
        }
      }, { rootMargin: '200px' })
      obs.observe(imgRef.current)
      return () => obs.disconnect()
    }, [msg.file_url, isImage])

    if (isImage) {
      return (
        <div ref={imgRef as any} className="mt-1.5 rounded-xl overflow-hidden bg-white/5">
          {loaded ? (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
              <img data-src={msg.file_url} src={msg.file_url} alt={msg.file_name || 'Image'} className="max-w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
            </a>
          ) : (
            <div className="flex items-center justify-center h-32 text-white/30"><Loader2 size={20} className="animate-spin" /></div>
          )}
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="mt-1.5 rounded-xl overflow-hidden bg-black/30">
          <video src={msg.file_url} controls preload="metadata" className="max-w-full h-auto max-h-48" playsInline>
            <source src={msg.file_url} />
          </video>
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="mt-1.5 flex items-center gap-2 p-2 bg-white/5 rounded-xl">
          <Music size={16} className="text-blue-400 shrink-0" />
          <audio src={msg.file_url} controls className="h-8 flex-1 min-w-0" preload="none" />
        </div>
      )
    }

    return (
      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <FileText size={18} className="text-amber-400 shrink-0" />
        <span className="text-xs truncate text-white/70">{msg.file_name || 'Document'}</span>
        <ChevronDown size={14} className="text-white/30 shrink-0 ml-auto" />
      </a>
    )
  }

  return (
    <>
      <button
        onClick={() => { if (!profile) { router.push('/auth/login'); return }; setOpen(!open) }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all hover:bg-indigo-400"
        aria-label="Support chat"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {open && (
        <div ref={chatRef} className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 h-[32rem] rounded-2xl border border-white/10 bg-[#0A0A0F] backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center gap-2 shrink-0">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} ${connected ? '' : 'animate-pulse'}`} />
            <MessageCircle size={16} className="text-indigo-400" />
            <span className="text-sm font-bold">Support Chat</span>
            {!connected && <span title="Reconnecting..."><WifiOff size={12} className="text-red-400 ml-auto" /></span>}
            {connected && <span className="text-[10px] text-green-400/60 ml-auto">Online</span>}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-white/30" size={20} /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-white/30 text-xs py-12 space-y-2">
                <MessageCircle size={32} className="mx-auto opacity-30" />
                <p>Send a message to start chatting</p>
                <p className="text-[10px] text-white/20">Ask for help, report bugs, or share feedback</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-2xl text-sm ${
                    msg.is_admin_reply
                      ? 'bg-white/5 text-white/80 rounded-bl-md'
                      : 'bg-indigo-500/20 text-white rounded-br-md'
                  }`}>
                    {msg.is_admin_reply && (
                      <p className="text-[10px] text-indigo-400 font-semibold mb-0.5">
                        {msg.users?.full_name || 'Admin'}
                      </p>
                    )}
                    {msg.message && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>}
                    <FileMessage msg={msg} />
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[10px] text-white/30">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {!msg.is_admin_reply && msg.read_at && (
                        <Check size={10} className="text-blue-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 shrink-0">
            <AttachmentPreview />
            <div className="relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 pr-24 rounded-xl text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 text-white placeholder-white/30"
                disabled={sending || uploading}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileSelect} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || sending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30"
                  title="Attach file"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin text-white/50" /> : <Paperclip size={14} className="text-white/50" />}
                </button>
                <button onClick={polishWithAI} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title="Polish with AI">
                  <Sparkles size={14} className="text-indigo-400" />
                </button>
                <button onClick={sendMessage} disabled={sending || (!input.trim() && !attachment)} className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-500/80 transition-colors disabled:opacity-30">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
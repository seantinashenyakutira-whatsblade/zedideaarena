'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MessageCircle, Send, Loader2, Image, FileText, Paperclip, Check, WifiOff, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function UserMessages() {
  const { profile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [connected, setConnected] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (profile) fetchChat() }, [profile])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return
    const sub = supabase
      .channel(`user-chat-${conversationId}`)
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
  }, [conversationId])

  const fetchChat = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/arena/chat')
      const data = res?.data || []
      if (data.length > 0) {
        const conv = data[0]
        setConversationId(conv.conversation_id)
        const msgRes: any = await api.get(`/arena/chat?conversation_id=${conv.conversation_id}`)
        setMessages(msgRes?.data || [])
      }
    } catch (e: any) { console.error('Fetch chat error:', e) } finally { setLoading(false) }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const res: any = await api.post('/arena/chat', { message: text })
      if (res?.data) {
        setConversationId(res.data.conversation_id)
        setMessages(prev => [...prev, res.data])
      }
    } catch (e: any) { toast.error(e?.data?.message || e?.message || 'Failed to send'); console.error('Send error:', e) } finally { setSending(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const upload: any = await api.post('/arena/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (upload?.data) {
        const att = upload.data
        const res: any = await api.post('/arena/chat', {
          message: `Sent a ${att.type}`,
          file_url: att.url,
          file_type: att.type,
          file_name: att.name,
          file_size: att.size,
        })
        if (res?.data) {
          setConversationId(res.data.conversation_id)
          setMessages(prev => [...prev, res.data])
        }
      }
    } catch (e: any) { toast.error(e?.data?.message || e?.message || 'Upload failed'); console.error('Upload error:', e) } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const FileMessage = ({ msg }: { msg: any }) => {
    if (!msg.file_url) return null
    const isImage = msg.file_type === 'image'
    if (isImage) {
      return (
        <div className="mt-1.5 rounded-xl overflow-hidden bg-white/5">
          <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
            <img src={msg.file_url} alt="" className="max-w-full h-auto max-h-48 object-cover cursor-pointer" loading="lazy" />
          </a>
        </div>
      )
    }
    if (msg.file_type === 'video') {
      return (
        <div className="mt-1.5 rounded-xl overflow-hidden bg-black/30">
          <video src={msg.file_url} controls preload="metadata" className="max-w-full h-auto max-h-48" playsInline />
        </div>
      )
    }
    return (
      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-2 p-2 bg-white/5 rounded-xl hover:bg-white/10">
        <FileText size={16} className="text-amber-400 shrink-0" />
        <span className="text-xs truncate text-white/70">{msg.file_name || 'File'}</span>
      </a>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} ${connected ? '' : 'animate-pulse'}`} />
        <MessageCircle size={18} className="text-indigo-400" />
        <div>
          <p className="text-sm font-bold">Support Chat</p>
          <p className="text-[10px] text-white/40">Admins typically reply within 24 hours</p>
        </div>
        {!connected && (
          <span className="ml-auto text-[10px] text-red-400/60 flex items-center gap-1">
            <WifiOff size={10} /> Reconnecting...
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-white/30" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-12 space-y-2">
            <MessageCircle size={40} className="mx-auto opacity-30" />
            <p className="font-bold">No messages yet</p>
            <p className="text-xs text-white/20">Send a message below to contact the admin team</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.is_admin_reply
                  ? 'bg-white/5 text-white/80 rounded-bl-md'
                  : 'bg-indigo-500/20 text-white rounded-br-md'
              }`}>
                {msg.is_admin_reply && (
                  <p className="text-[10px] text-indigo-400 font-semibold mb-0.5">{msg.users?.full_name || 'Admin'}</p>
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
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="relative">
          <input ref={inputRef as any}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..." className="w-full px-4 py-2.5 pr-20 rounded-xl text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 text-white placeholder-white/30"
            disabled={sending || uploading}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} className="text-white/50" />}
            </button>
            <button onClick={sendMessage} disabled={sending || !input.trim()} className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-500/80 disabled:opacity-30">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

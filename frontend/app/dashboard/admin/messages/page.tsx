'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MessageCircle, ArrowLeft, Send, Loader2, Image, FileText, Paperclip, ChevronDown, Search, Clock, Check, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminMessages() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (profile?.is_admin || profile?.role === 'admin') fetchConversations() }, [profile])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Real-time subscription for selected conversation
  useEffect(() => {
    if (!selectedConv) return
    const sub = supabase
      .channel(`admin-chat-${selectedConv.conversation_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'arena_chat_messages',
        filter: `conversation_id=eq.${selectedConv.conversation_id}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [selectedConv])

  const fetchConversations = async () => {
    try {
      const res: any = await api.get('/arena/chat')
      setConversations(res?.data || [])
    } catch {} finally { setLoading(false) }
  }

  const selectConversation = async (conv: any) => {
    setSelectedConv(conv)
    setMessages([])
    try {
      const res: any = await api.get(`/arena/chat?conversation_id=${conv.conversation_id}`)
      setMessages(res?.data || [])
      // Mark as read
      api.post(`/arena/chat/${conv.conversation_id}/read`).catch(() => {})
    } catch {}
  }

  const sendReply = async () => {
    if (!input.trim() || sending || !selectedConv) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const res: any = await api.post(`/arena/chat/${selectedConv.conversation_id}/reply`, { message: text })
      if (res?.data) {
        setMessages(prev => [...prev, res.data])
        setConversations(prev => prev.map(c =>
          c.conversation_id === selectedConv.conversation_id
            ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
            : c
        ))
      }
    } catch {} finally { setSending(false) }
  }

  const handleFileReply = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedConv) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const upload: any = await api.post('/arena/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (upload?.data) {
        const att = upload.data
        const res: any = await api.post(`/arena/chat/${selectedConv.conversation_id}/reply`, {
          message: `Sent a ${att.type}`,
          file_url: att.url,
          file_type: att.type,
          file_name: att.name,
          file_size: att.size,
        })
        if (res?.data) {
          setMessages(prev => [...prev, res.data])
        }
      }
    } catch {} finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  if (!profile?.is_admin && profile?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-zed-background text-zed-foreground">
        <div className="text-center"><AlertCircle size={64} className="mx-auto mb-4 text-red-500" /><h1 className="text-2xl font-black">Access Denied</h1></div>
      </div>
    )
  }

  const filtered = conversations.filter(c =>
    c.user_name?.toLowerCase().includes(search.toLowerCase())
  )

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
        <ChevronDown size={12} className="text-white/30 shrink-0 ml-auto" />
      </a>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Conversation List */}
      <div className={`w-full md:w-80 shrink-0 border border-white/10 rounded-2xl overflow-hidden bg-white/5 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <MessageCircle size={14} /> Conversations
          </h2>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 text-white placeholder-white/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-white/30" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-white/30 text-xs py-12">No conversations yet</div>
          ) : filtered.map((conv) => (
            <button key={conv.conversation_id} onClick={() => selectConversation(conv)}
              className={`w-full text-left p-4 hover:bg-white/[0.04] transition-colors ${selectedConv?.conversation_id === conv.conversation_id ? 'bg-white/[0.06]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                  {conv.user_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{conv.user_name || 'Unknown'}</p>
                    {conv.last_message_at && (
                      <span className="text-[10px] text-white/30 shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message || 'No messages'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 border border-white/10 rounded-2xl overflow-hidden bg-white/5 flex flex-col ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
              <button onClick={() => setSelectedConv(null)} className="md:hidden text-white/50 hover:text-white"><ArrowLeft size={18} /></button>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                {selectedConv.user_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold">{selectedConv.user_name || 'Unknown'}</p>
                <p className="text-[10px] text-white/40">{messages.length} messages</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.is_admin_reply
                      ? 'bg-indigo-500/20 text-white rounded-br-md'
                      : 'bg-white/5 text-white/80 rounded-bl-md'
                  }`}>
                    {!msg.is_admin_reply && (
                      <p className="text-[10px] text-indigo-400 font-semibold mb-0.5">{selectedConv.user_name || 'User'}</p>
                    )}
                    {msg.message && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>}
                    <FileMessage msg={msg} />
                    <p className="text-[10px] text-white/30 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.is_admin_reply && <Check size={10} className="inline ml-1 text-blue-400" />}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 shrink-0">
              <div className="relative">
                <input ref={inputRef as any}
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Reply as admin..." className="w-full px-4 py-2.5 pr-20 rounded-xl text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 text-white placeholder-white/30"
                  disabled={sending || uploading}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileReply} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} className="text-white/50" />}
                  </button>
                  <button onClick={sendReply} disabled={sending || !input.trim()} className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-500/80 disabled:opacity-30">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
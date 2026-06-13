'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function ArenaChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { profile } = useAuth()
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) fetchMessages() }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/arena/chat')
      const convs = res?.data || []
      if (convs.length > 0) {
        const latest = convs.sort((a: any, b: any) =>
          (b.messages?.[b.messages.length - 1]?.created_at || '') > (a.messages?.[a.messages.length - 1]?.created_at || '') ? 1 : -1
        )[0]
        setMessages(latest.messages || [])
        setConversationId(latest.conversation_id)
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

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const res: any = await api.post('/arena/chat', {
        message: text,
        conversation_id: conversationId || undefined,
      })
      if (res?.data) {
        setMessages(prev => [...prev, res.data])
        if (!conversationId) setConversationId(res.data.conversation_id)
      }
    } catch {} finally { setSending(false) }
  }

  return (
    <>
      <button
        onClick={() => { if (!profile) { router.push('/auth/login'); return }; setOpen(!open) }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all hover:bg-indigo-400"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 h-96 rounded-2xl border border-white/10 bg-[#0A0A0F] backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <MessageCircle size={16} className="text-indigo-400" />
            <span className="text-sm font-bold">Support Chat</span>
            <span className="text-[10px] text-white/30 ml-auto">Admins are online</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-white/30" size={20} /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-white/30 text-xs py-12">Send a message to start chatting with the team</div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-2.5 rounded-2xl text-sm ${
                    msg.is_admin_reply
                      ? 'bg-white/5 text-white/80 rounded-bl-md'
                      : 'bg-indigo-500/20 text-white rounded-br-md'
                  }`}>
                    {msg.is_admin_reply && <p className="text-[10px] text-indigo-400 font-semibold mb-0.5">Admin</p>}
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] text-white/30 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 pr-20 rounded-xl text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 text-white placeholder-white/30"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button onClick={polishWithAI} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title="Polish with AI">
                  <Sparkles size={14} className="text-indigo-400" />
                </button>
                <button onClick={sendMessage} disabled={sending || !input.trim()} className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-500/80 transition-colors disabled:opacity-30">
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

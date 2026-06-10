'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are the ZedIdeaArena AI assistant. You help users understand how the platform works.

Key facts:
- ZedIdeaArena is a competition platform where contestants submit business ideas and voters judge them.
- Contestants pay an entry fee to submit an idea.
- Voters pay a fee to vote on ideas.
- Prize pools are split: 25% to 1st place, 10% to 2nd, 5% to 3rd, 60% to platform.
- Users can switch between Contestant and Voter mode.
- Entry fee is $5.00, voter fee is $15.00.
- Ideas must be approved by admin before going public.
- Stripe is used for payments.

Be concise, helpful, and encouraging. If you don't know something, suggest the user check the docs or contact support.`

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://zedideaarena.com',
          'X-Title': 'ZedIdeaArena',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
            userMsg,
          ],
          max_tokens: 512,
        }),
      })

      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content || 'Sorry, I could not process that. Please try again.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Arena Assistant</p>
                  <p className="text-[10px] text-white/40">Powered by DeepSeek</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}>
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot size={40} className="mx-auto mb-4 text-white/20" />
                  <p className="text-sm font-bold text-white/60 mb-1">Hi! How can I help?</p>
                  <p className="text-xs text-white/30">Ask me about competitions, fees, voting, or anything else.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-zed-primary/20' : 'bg-zed-accent/20'}`}>
                    {msg.role === 'user' ? <User size={14} className="text-zed-primary" /> : <Bot size={14} style={{ color: '#22D3EE' }} />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm border border-white/5'
                  }`} style={
                    msg.role === 'user'
                      ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.1))' }
                      : { background: 'rgba(255,255,255,0.03)' }
                  }>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zed-accent/20">
                    <Bot size={14} style={{ color: '#22D3EE' }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-white/10 outline-none transition-all focus:border-zed-primary/50"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

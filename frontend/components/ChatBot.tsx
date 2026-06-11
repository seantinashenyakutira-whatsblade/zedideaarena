'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles, Play } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = getYouTubeId(url)
  const [play, setPlay] = useState(false)
  if (!videoId) return null
  if (play) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-2 mb-2">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }
  return (
    <button
      onClick={() => setPlay(true)}
      className="relative w-full aspect-video rounded-xl overflow-hidden mt-2 mb-2 group cursor-pointer border-0 p-0"
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="YouTube video"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-active:scale-95">
          <Play size={26} className="text-black ml-0.5" />
        </div>
      </div>
    </button>
  )
}

const SYSTEM_PROMPT = `You are the ZedIdeaArena AI assistant. You help users understand how the platform works.

Key facts:
- ZedIdeaArena is a competition platform where contestants submit business ideas and voters judge them.
- Contestants pay a $5 entry fee to submit an idea.
- Voters pay a fee to vote on ideas.
- Prize pool = $5 per paid idea entry, split 50% to 1st, 30% to 2nd, 20% to 3rd.
- Users can switch between Contestant and Voter mode.
- Each contestant can submit up to 3 ideas per competition.
- Ideas must be approved by admin before going public.
- Stripe is used for payments.

Respond in a friendly, concise way. Use markdown formatting: **bold** for emphasis, bullet points for lists, and short paragraphs. Keep responses under 150 words.`

const SUGGESTIONS = [
  'How do I submit an idea?',
  'How does the prize pool work?',
  'What is the entry fee?',
  'How do I switch to voter mode?',
]

function formatMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: (React.ReactElement | string)[] = []
  let inList = false
  let listItems: React.ReactElement[] = []
  let key = 0

  const renderInline = (line: string) => {
    const parts: (React.ReactElement | string)[] = []
    let remaining = line

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
      const codeMatch = remaining.match(/`(.+?)`/)
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/)

      const matches: { index: number; length: number; render: () => React.ReactElement }[] = []
      if (boldMatch) matches.push({ index: boldMatch.index!, length: boldMatch[0].length, render: () => <strong key={key++}>{boldMatch![1]}</strong> })
      if (italicMatch) matches.push({ index: italicMatch.index!, length: italicMatch[0].length, render: () => <em key={key++}>{italicMatch![1]}</em> })
      if (codeMatch) matches.push({ index: codeMatch.index!, length: codeMatch[0].length, render: () => <code key={key++} className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">{codeMatch![1]}</code> })
      if (linkMatch) {
        const href = linkMatch[2]
        const isYt = getYouTubeId(href)
        matches.push({
          index: linkMatch.index!,
          length: linkMatch[0].length,
          render: () => isYt
            ? <YouTubeEmbed key={key++} url={href} />
            : <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-zed-primary underline">{linkMatch![1]}</a>,
        })
      }

      if (matches.length === 0) {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }

      matches.sort((a, b) => a.index - b.index)
      const first = matches[0]

      if (first.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>)
      }
      parts.push(first.render())
      remaining = remaining.slice(first.index + first.length)
    }

    return parts.length > 0 ? parts : line
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      if (inList) {
        elements.push(<ul key={key++} className="space-y-1 my-1.5">{listItems}</ul>)
        listItems = []
        inList = false
      }
      continue
    }

    const ytId = getYouTubeId(trimmed)
    if (ytId) {
      if (inList) {
        elements.push(<ul key={key++} className="space-y-1 my-1.5">{listItems}</ul>)
        listItems = []
        inList = false
      }
      elements.push(<YouTubeEmbed key={key++} url={trimmed} />)
      continue
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/)
    const numMatch = trimmed.match(/^\d+\.\s+(.+)/)

    if (bulletMatch || numMatch) {
      inList = true
      const content = bulletMatch ? bulletMatch[1] : numMatch![1]
      listItems.push(
        <li key={`${key++}-${i}`} className="flex gap-2 text-sm">
          <span className="text-zed-accent mt-0.5">•</span>
          <span>{renderInline(content)}</span>
        </li>
      )
      continue
    }

    if (inList) {
      elements.push(<ul key={key++} className="space-y-1 my-1.5">{listItems}</ul>)
      listItems = []
      inList = false
    }

    const headingMatch = trimmed.match(/^###?\s+(.+)/)
    if (headingMatch) {
      elements.push(<h4 key={key++} className="font-bold text-sm mt-3 mb-1">{renderInline(headingMatch[1])}</h4>)
      continue
    }

    elements.push(<p key={key++} className="text-sm leading-relaxed">{renderInline(trimmed)}</p>)
  }

  if (inList) {
    elements.push(<ul key={key++} className="space-y-1 my-1.5">{listItems}</ul>)
  }

  return <>{elements}</>
}

function TypewriterText({ content, onDone }: { content: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')

    intervalRef.current = setInterval(() => {
      if (indexRef.current < content.length) {
        setDisplayed(content.slice(0, indexRef.current + 3))
        indexRef.current += 3
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onDone()
      }
    }, 15)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [content, onDone])

  return <>{formatMarkdown(displayed)}</>
}

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingId, setTypingId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingId])

  const handleTypingDone = useCallback(() => {
    setTypingId(null)
  }, [])

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
          model: 'openai/gpt-oss-120b:free',
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

      const msgId = messages.length + 1
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setTypingId(msgId)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(34,211,238,0.04))' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Arena Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={10} className="text-zed-accent" />
                    <p className="text-[9px] text-white/40 font-medium tracking-wide">AI-powered</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                <X size={16} className="text-white/40" />
              </button>
            </div>

            <div className="h-[420px] overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}>
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.1))' }}>
                    <Bot size={28} className="text-zed-accent" />
                  </div>
                  <p className="text-base font-bold text-white/80 mb-1">Hi! How can I help?</p>
                  <p className="text-xs text-white/30 mb-6">Ask me anything about ZedIdeaArena</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); setOpen(true) }}
                        className="block w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-zed-primary/20' : ''}`} style={msg.role === 'assistant' ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.15))' } : {}}>
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
                    {msg.role === 'assistant' && i === typingId ? (
                      <TypewriterText content={msg.content} onDone={handleTypingDone} />
                    ) : msg.role === 'assistant' ? (
                      formatMarkdown(msg.content)
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.15))' }}>
                    <Bot size={14} style={{ color: '#22D3EE' }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366F1', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-white/10 outline-none transition-all focus:border-zed-primary/50 placeholder:text-white/20"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
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

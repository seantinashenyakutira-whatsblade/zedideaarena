'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4"
        >
          <div className="p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl" style={{ background: 'rgba(10,10,15,0.95)' }}>
            <button onClick={() => setVisible(false)} className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Cookie size={20} style={{ color: '#6366F1' }} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1">We use cookies</p>
                <p className="text-xs text-white/50 leading-relaxed">We use essential cookies for security and analytics. You can choose what to accept.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={acceptNecessary} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                Necessary Only
              </button>
              <button onClick={acceptAll} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

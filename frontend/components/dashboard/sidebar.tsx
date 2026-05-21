'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Trophy, Vote, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/ideas', icon: FileText, label: 'My Ideas' },
  { href: '/dashboard/competitions', icon: Trophy, label: 'Competitions' },
  { href: '/dashboard/voting', icon: Vote, label: 'Voting Arena' },
  { href: '/dashboard/admin', icon: Settings, label: 'Admin Panel', role: 'admin' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { profile, logout } = useAuth()

  const filteredNavItems = navItems.filter(item => {
    if (item.role === 'admin' && profile?.role !== 'admin') return false
    return true
  })

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden btn-icon fixed top-4 left-4 z-50">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 left-0 h-screen w-64 glass-premium border-r border-white/5 transition-all duration-300 z-40 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0 overflow-auto' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 mt-12 md:mt-0 floating">
          <img src="/logo-icon.png" alt="ZedIdeaArena Icon" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
          <span className="font-black text-xl gradient-text tracking-tighter uppercase">ZedArena</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 click-push ${isActive ? 'bg-zed-primary text-white shadow-[0_4px_15px_rgba(79,70,229,0.4)] border border-white/10' : 'text-zed-foreground-secondary hover:bg-white/5 hover:text-zed-foreground'}`}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse' : ''} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zed-foreground-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Exit Arena</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}

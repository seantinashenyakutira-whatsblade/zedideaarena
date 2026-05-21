'use client'

import Link from 'next/link'
import { AlertOctagon, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zed-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="card-zed glass-premium p-12 max-w-lg w-full text-center tilt-3d relative z-10 border-white/10 shadow-2xl">
        <div className="mb-8 flex justify-center floating">
          <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)] opacity-50 grayscale" />
        </div>
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8 floating border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertOctagon size={48} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </div>

        <h1 className="text-6xl font-black text-zed-foreground mb-4 tracking-tighter drop-shadow-lg">
          404
        </h1>
        <h2 className="text-2xl font-bold text-zed-foreground mb-4">
          Lost in the Arena
        </h2>
        <p className="text-zed-foreground-secondary mb-10 leading-relaxed font-medium">
          The quadrant you&apos;re looking for doesn&apos;t exist or has been moved to a different dimension.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary px-6 py-3 flex items-center justify-center gap-2 font-bold click-push">
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link href="/dashboard" className="btn-primary px-6 py-3 flex items-center justify-center gap-2 font-bold click-push shadow-lg shadow-indigo-500/30">
            <Home size={18} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

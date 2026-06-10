'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trophy, CheckCircle2, Copy, ArrowRight, Clock, Eye, BarChart3, Award } from 'lucide-react'
import { toast } from 'sonner'

function IdeaSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const title = searchParams.get('title') || 'your idea'
  const competition = searchParams.get('competition') || 'the competition'
  const ideaId = searchParams.get('id') || ''

  const handleCopyLink = () => {
    const link = ideaId ? `${window.location.origin}/ideas/${ideaId}` : window.location.href
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-2xl mx-auto p-12">
        <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8 floating">
          <Trophy size={64} className="text-zed-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        </div>

        <h1 className="text-4xl font-black text-zed-foreground mb-4">Your idea has been submitted.</h1>

        <div className="space-y-4 mb-8">
          <p className="text-zed-foreground text-xl font-bold">
            Idea: {title}
          </p>
          <p className="text-zed-foreground-secondary text-lg">
            Competition: {competition}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold text-xs uppercase tracking-widest">
            <Clock size={14} />
            Pending Review
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black mb-10"
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Share your idea link'}
        </button>

        <div className="bg-white/5 rounded-3xl border border-white/10 p-8 mb-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-zed-foreground-secondary mb-6">
            What happens next
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-zed-primary/20 flex items-center justify-center flex-shrink-0">
                <Eye size={20} className="text-zed-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-zed-foreground">Admin reviews your idea</p>
                <p className="text-sm text-zed-foreground-secondary">Our team reviews your submission (1-2 days)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-zed-primary/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={20} className="text-zed-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-zed-foreground">Idea goes public for voting</p>
                <p className="text-sm text-zed-foreground-secondary">Once approved, voters can discover and support your idea</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-zed-primary/20 flex items-center justify-center flex-shrink-0">
                <Trophy size={20} className="text-zed-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-zed-foreground">Winners announced</p>
                <p className="text-sm text-zed-foreground-secondary">Standings finalize when the competition closes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard/ideas')}
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-black shadow-xl"
          >
            View My Ideas <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IdeaSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zed-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
    </div>}>
      <IdeaSuccessContent />
    </Suspense>
  )
}

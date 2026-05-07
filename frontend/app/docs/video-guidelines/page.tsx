'use client'

import { ArrowLeft, Video, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function VideoGuidelinesPage() {
  return (
    <div className="min-h-screen bg-zed-background text-zed-foreground p-8 pb-24">
      <div className="max-w-4xl mx-auto animate-zed-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <h1 className="text-5xl font-black gradient-text">Video Guidelines</h1>
        </div>

        <div className="space-y-12">
          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Video className="text-zed-primary" /> The Perfect Pitch</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed mb-6">
              Your video pitch is the most important part of your submission. It is your direct line to voters and investors.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <h3 className="font-black text-zed-success flex items-center gap-2"><CheckCircle size={18} /> Do's</h3>
                <ul className="space-y-3 text-sm text-zed-foreground-secondary">
                  <li>• Keep it between 2 to 5 minutes.</li>
                  <li>• Clearly state the problem you are solving.</li>
                  <li>• Introduce your team and your traction.</li>
                  <li>• Ensure good lighting and clear audio.</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-black text-red-500 flex items-center gap-2"><XCircle size={18} /> Don'ts</h3>
                <ul className="space-y-3 text-sm text-zed-foreground-secondary">
                  <li>• Do not include copyrighted background music.</li>
                  <li>• Avoid using complex jargon without explanation.</li>
                  <li>• Do not record in a noisy environment.</li>
                  <li>• Do not exceed the 5-minute limit.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

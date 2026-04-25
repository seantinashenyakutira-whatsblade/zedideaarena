'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ShieldCheck, Video, CheckCircle2, User, Camera, Image as ImageIcon } from 'lucide-react'

export default function VideoGuidelinesPage() {
  return (
    <div className="flex h-screen bg-zed-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-zed-primary/10 rounded-2xl text-zed-primary">
                  <Video size={32} />
                </div>
                <h1 className="text-4xl font-black text-zed-foreground">Video Pitch Guidelines</h1>
              </div>
              <p className="text-lg text-zed-foreground-secondary font-medium">
                Your video is your most powerful tool in the Arena. Follow these standards to ensure your vision is presented professionally.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-zed p-8 border-white/5 space-y-6">
                <h3 className="text-xl font-black text-zed-foreground flex items-center gap-3">
                  <Camera className="text-zed-primary" size={24} /> Visual Standards
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Clean Background</p>
                      <p className="text-xs text-zed-foreground-secondary">Use a neutral, non-distracting background. A solid wall or a clean office space is ideal.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Person Centered</p>
                      <p className="text-xs text-zed-foreground-secondary">Position yourself in the center of the frame, from the waist or chest up.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Good Lighting</p>
                      <p className="text-xs text-zed-foreground-secondary">Ensure your face is well-lit. Natural light from a window is best.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="card-zed p-8 border-white/5 space-y-6">
                <h3 className="text-xl font-black text-zed-foreground flex items-center gap-3">
                  <User className="text-zed-primary" size={24} /> Presentation
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Introduction</p>
                      <p className="text-xs text-zed-foreground-secondary">Briefly introduce yourself and your professional background at the start.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Clear Explanation</p>
                      <p className="text-xs text-zed-foreground-secondary">Explain the problem, your solution, and the potential impact clearly.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-zed-success flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-zed-foreground">Time Limit</p>
                      <p className="text-xs text-zed-foreground-secondary">Keep your pitch between 2 and 5 minutes. Quality over quantity.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 glass-premium rounded-3xl border border-zed-primary/20 bg-zed-primary/5">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-zed-primary/20 rounded-2xl text-zed-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-zed-foreground mb-2">Technical Requirements</h4>
                  <p className="text-sm text-zed-foreground-secondary leading-relaxed mb-6">
                    No heavy editing or special effects are required. We value the clarity of your vision over production value. However, the audio must be clear and the video resolution should be at least 720p.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Format: MP4 / MOV</span>
                    <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Size: Up to 500MB</span>
                    <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Ratio: 16:9 (Landscape)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Video, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'

const validateYouTubeUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/
  return pattern.test(url)
}

interface PitchVideoGuideProps {
  value: string
  onChange: (value: string) => void
}

export default function PitchVideoGuide({ value, onChange }: PitchVideoGuideProps) {
  const [openSection, setOpenSection] = useState<number | null>(null)
  const isValid = value ? validateYouTubeUrl(value) : null

  const toggleSection = (num: number) => {
    setOpenSection(openSection === num ? null : num)
  }

  const sections = [
    {
      num: 1,
      title: 'How to upload correctly',
      content: (
        <div className="space-y-8 text-sm">
          <div>
            <p className="font-bold text-white mb-2">Step 1 — TITLE</p>
            <p className="text-zed-foreground-secondary">
              Your video title must match your idea title exactly.<br />
              Example: &ldquo;FarmLink — Connecting Farmers to Markets&rdquo;
            </p>
          </div>
          <div>
            <p className="font-bold text-white mb-2">Step 2 — PRIVACY</p>
            <p className="text-zed-foreground-secondary">
              Set your video to <strong>UNLISTED</strong> (not private, not public).<br />
              This means only people with the link can watch it.
            </p>
          </div>
          <div>
            <p className="font-bold text-white mb-2">Step 3 — DESCRIPTION</p>
            <p className="text-zed-foreground-secondary">
              In your video description, include:
            </p>
            <ul className="list-disc list-inside text-zed-foreground-secondary mt-1 space-y-1">
              <li>Brief summary of your idea</li>
              <li>Any reference links (GitHub, research, prototypes)</li>
              <li>Your contact email</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-white mb-2">Step 4 — RECORDING GUIDELINES</p>
            <ul className="space-y-2 text-zed-foreground-secondary">
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> Your face must be visible for most of the video</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> Speak clearly — no background music needed</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> No sound effects required</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> Record in a quiet place</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> 2 to 5 minutes maximum</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> Good lighting on your face</li>
              <li className="flex items-start gap-2"><span className="text-zed-success shrink-0">✓</span> Simple background — no distractions</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-white mb-2">Step 5 — THUMBNAIL</p>
            <p className="text-zed-foreground-secondary">
              Add a thumbnail showing your face clearly.<br />
              Use your idea title as text on the thumbnail.<br />
              Keep it clean and simple.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="card-zed glass-premium p-8 border-white/5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zed-primary/20 rounded-2xl flex items-center justify-center shrink-0">
          <Video size={24} className="text-zed-primary" />
        </div>
        <div>
          <p className="font-black text-lg text-zed-foreground">Pitch Video Guide</p>
          <p className="text-xs text-zed-foreground-secondary">
            Upload your pitch to YouTube first, then paste the link below.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(1)}
          className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
        >
          <span className="text-xs font-black uppercase tracking-widest">How to upload correctly</span>
          <ChevronDown
            size={16}
            className={`text-zed-foreground-secondary transition-transform ${
              openSection === 1 ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openSection === 1 && (
          <div className="p-6 border-t border-white/10">
            {sections[0].content}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block">
          YouTube Video URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={`input-zed h-14 text-sm pr-12 ${
              isValid === true
                ? 'border-zed-success ring-1 ring-zed-success/30'
                : isValid === false
                ? 'border-red-500 ring-1 ring-red-500/30'
                : ''
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isValid === true && (
              <CheckCircle2 size={22} className="text-zed-success" />
            )}
            {isValid === false && (
              <XCircle size={22} className="text-red-500" />
            )}
          </div>
        </div>
        {isValid === false && (
          <p className="text-xs text-red-400 mt-1">
            Please enter a valid YouTube URL
          </p>
        )}
      </div>
    </div>
  )
}

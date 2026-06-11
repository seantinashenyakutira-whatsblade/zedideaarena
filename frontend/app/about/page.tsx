'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Target, Heart, Globe, Lightbulb, Users, Award, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { team } from '@/lib/team'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const values = [
  { icon: Lightbulb, title: 'Innovation First', desc: 'We believe great ideas can come from anywhere. Our platform eliminates gatekeepers and lets the community decide what deserves funding.' },
  { icon: Shield, title: 'Transparency', desc: 'Every vote is counted, every fee is公开, and every prize distribution is automatic and verifiable on-chain.' },
  { icon: Users, title: 'Community Powered', desc: 'Decisions are made by real people, not algorithms. Voters are verified, and every voice counts equally.' },
  { icon: Globe, title: 'Pan-African Reach', desc: 'Founded in Southern Africa with a vision to connect innovators across the entire continent and beyond.' },
]

export default function AboutPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Hero */}
        <motion.div {...fadeUp} className="mb-24">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            We&apos;re on a mission to{' '}
            <span className="gradient-text">fund 100 ideas</span>
            <br />by end of 2026.
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            ZedIdeaArena is a competition platform where innovators pitch their ideas, 
            voters judge them, and the best ideas win real funding. No VCs, no banks — 
            just the community deciding what gets built.
          </p>
        </motion.div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-black mb-6">The Story</h2>
            <div className="space-y-4 text-white/50 leading-relaxed">
              <p>ZedIdeaArena was born from a simple observation: talented innovators across Africa have world-class ideas but no access to early-stage funding. Traditional VCs are concentrated in a few hubs, and bank loans require collateral most young founders don't have.</p>
              <p>We built a different model: let the community fund what they believe in. Contestants pay a small entry fee that goes into the prize pool. Verified voters pay a fee to judge and earn rewards. The best ideas win — simple, transparent, and fair.</p>
              <p>Headquartered in Southern Africa, we're starting locally and scaling globally. Our first competition is launching soon.</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <div className="rounded-3xl overflow-hidden border border-white/10 h-full min-h-[300px] flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.05)' }}>
              <Image src="/logo-full-dark.png" alt="ZedIdeaArena" width={200} height={200} className="object-contain opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div {...fadeUp} className="mb-24">
          <h2 className="text-3xl font-black mb-12 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Icon size={24} style={{ color: '#6366F1' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-black mb-12 text-center">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 text-center backdrop-blur-sm hover:border-white/20 transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-2 border-white/10 group-hover:border-zed-primary/30 transition-all" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <Image src={member.image} alt={member.name} width={80} height={80} className="w-full h-full object-cover opacity-70" />
                </div>
                <h4 className="font-bold text-sm mb-1">{member.name}</h4>
                <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>{member.role}</p>
                <p className="text-xs text-white/40 mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

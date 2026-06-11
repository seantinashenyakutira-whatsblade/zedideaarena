'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Info } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const tiers = [
  {
    title: 'Contestant',
    price: '$5',
    period: 'per competition',
    desc: 'Enter the arena and pitch your idea to the world.',
    features: [
      'Submit your idea to any competition',
      '2–5 minute YouTube pitch video',
      'Your idea visible to all voters',
      'Eligible for prize pool winnings',
      'Retain 100% IP ownership',
    ],
    primary: true,
    href: '/auth/signup?role=contestant',
  },
  {
    title: 'Voter',
    price: '$15',
    period: 'one-time',
    desc: 'Judge ideas, discover innovation, and earn rewards.',
    features: [
      'Vote on all competitions',
      'KYC verification included',
      'Earn rewards for picking winners',
      'See ideas before public release',
      'Community recognition',
    ],
    primary: false,
    href: '/auth/signup?role=voter',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div {...fadeUp} className="mb-16">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            Simple,{' '}
            <span className="gradient-text">transparent</span>
            <br />pricing
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            No hidden fees, no subscriptions. You only pay when you participate.
            Every dollar goes back to the community.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`p-10 rounded-3xl border backdrop-blur-sm transition-all duration-300 ${tier.primary ? 'border-zed-primary/30 hover:border-zed-primary/50' : 'border-white/10 hover:border-white/20'}`}
              style={{ background: tier.primary ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}
            >
              <h3 className="text-2xl font-black mb-2">{tier.title}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black gradient-text">{tier.price}</span>
                <span className="text-sm text-white/40">{tier.period}</span>
              </div>
              <p className="text-sm text-white/50 mb-8">{tier.desc}</p>

              <ul className="space-y-4 mb-10">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#22D3EE' }} />
                    <span className="text-white/60">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`block text-center py-4 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 ${tier.primary ? 'btn-glow' : 'border border-white/20 bg-white/5 hover:bg-white/10'}`}
                style={tier.primary ? { background: 'linear-gradient(135deg,#6366F1,#22D3EE)' } : {}}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Prize Breakdown */}
        <motion.div {...fadeUp} className="mb-24">
          <h2 className="text-3xl font-black mb-8">Prize Pool Breakdown</h2>
          <div className="border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="grid grid-cols-3 gap-px bg-white/5">
              {[
                { place: '1st Place', share: '25%', icon: '🥇', color: '#FFD700', amount: '$2,500' },
                { place: '2nd Place', share: '10%', icon: '🥈', color: '#C0C0C0', amount: '$1,000' },
                { place: '3rd Place', share: '5%', icon: '🥉', color: '#CD7F32', amount: '$500' },
              ].map((item, i) => (
                <div key={i} className="p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <p className="text-sm text-white/40 font-semibold mb-1">{item.place}</p>
                  <p className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.share}</p>
                  <p className="text-sm text-white/40">of prize pool</p>
                </div>
              ))}
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-white/40">
                <Info size={14} className="inline mr-1" />
                Based on a $10,000 prize pool. Actual amounts vary per competition.
                {' '}40% of total pool goes to winners. 60% funds operations and voter rewards.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-black mb-8">Pricing FAQ</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: 'Where does my entry fee go?', a: '100% of contestant entry fees go into the competition prize pool. We do not take a cut.' },
              { q: 'Why is there a voter fee?', a: 'The voter fee ensures only serious participants join the judging process. It also funds platform operations, development, and voter rewards.' },
              { q: 'Is the entry fee refundable?', a: 'The entry fee is non-refundable once your idea is published on the platform. You can withdraw before publication.' },
              { q: 'Can I enter multiple competitions?', a: 'Yes! You can enter as many competitions as you want. Each requires a separate $5 entry fee.' },
              { q: 'How are voter rewards calculated?', a: 'Voters who pick the winning ideas receive a share of the platform\'s portion of the prize pool. The exact amount depends on how many voters picked correctly.' },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

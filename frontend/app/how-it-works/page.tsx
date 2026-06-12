'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Users, Star, Trophy, Zap, Glasses, DollarSign, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema } from '@/lib/seo/json-ld'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const contestantSteps = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account as a Contestant. No credit card required to register.' },
  { num: '02', title: 'Find a Competition', desc: 'Browse active competitions and choose one that fits your idea. Each has a prize pool and deadline.' },
  { num: '03', title: 'Pay Entry Fee', desc: 'Pay the $5 entry fee. Every cent goes into the prize pool — we take zero from entry fees.' },
  { num: '04', title: 'Submit Your Pitch', desc: 'Upload a YouTube video (2–5 min), write your problem statement, solution, and why it matters.' },
  { num: '05', title: 'Get Voted On', desc: 'Verified voters review your pitch. Votes determine the winners.' },
  { num: '06', title: 'Win & Get Paid', desc: 'Top 3 ideas split 40% of the prize pool. 1st: 25%, 2nd: 10%, 3rd: 5%.' },
]

const voterSteps = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account as a Voter.' },
  { num: '02', title: 'Verify Your Identity', desc: 'Complete KYC to ensure one person = one vote. This keeps the competition fair.' },
  { num: '03', title: 'Pay Voter Fee', desc: 'Pay the $15 voter fee. This grants you access to judge all competitions.' },
  { num: '04', title: 'Watch Pitches', desc: 'Browse all submitted ideas and watch the pitch videos.' },
  { num: '05', title: 'Cast Your Vote', desc: 'Vote for the ideas you believe in. One vote per competition.' },
  { num: '06', title: 'Earn Rewards', desc: 'Voters who pick winning ideas earn rewards from the platform share.' },
]

const faqs = [
  { q: 'How much does it cost to enter as a contestant?', a: 'The entry fee is $5.00 per competition. This fee goes entirely into the prize pool. We do not take a cut of entry fees.' },
  { q: 'How much does it cost to become a voter?', a: 'The voter registration fee is $15.00. This is a one-time fee that grants you access to vote on all competitions.' },
  { q: 'How is the prize pool distributed?', a: '40% of the total prize pool is distributed to the top 3 ideas: 1st place gets 25%, 2nd gets 10%, 3rd gets 5%. The remaining 60% funds platform operations and voter rewards.' },
  { q: 'Can I enter as both a contestant and voter?', a: 'Yes! You can switch between roles in your account settings. However, you cannot vote on your own idea in a competition you entered.' },
  { q: 'What happens to my idea if I don\'t win?', a: 'You retain all rights to your idea. Non-winning entries are removed from public view after the competition ends, but you can re-enter future competitions.' },
  { q: 'How are votes verified?', a: 'Every voter must complete KYC (Know Your Customer) verification. This prevents bots and ensures one person = one vote.' },
  { q: 'When do winners get paid?', a: 'Winners are paid within 7 days after the competition ends, following identity verification and compliance checks.' },
  { q: 'Can I withdraw my submission?', a: 'Yes, you can withdraw before the submission deadline. However, the entry fee is non-refundable once your idea is published.' },
  { q: 'Who owns the intellectual property?', a: 'You retain 100% ownership of your idea. We only have a license to display and promote it within the competition context.' },
  { q: 'Is ZedIdeaArena available outside Africa?', a: 'Yes! While we started in Southern Africa, anyone from any country can participate as a contestant or voter.' },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm transition-all" style={{ background: open ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-6 text-left">
        <span className="font-bold text-sm pr-4">{q}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: '#6366F1' }} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="px-6 text-sm text-white/50 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <JsonLd data={faqSchema(faqs)} id="faq-schema" />
      <div className="max-w-6xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div {...fadeUp} className="mb-24">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            How It{' '}
            <span className="gradient-text">Works</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            Whether you&apos;re an innovator with a world-changing idea or a voter who wants 
            to discover the next big thing — here&apos;s exactly how the process works.
          </p>
        </motion.div>

        {/* Contestant Flow */}
        <motion.div {...fadeUp} className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Users size={24} style={{ color: '#6366F1' }} />
            </div>
            <h2 className="text-3xl font-black">For Contestants</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contestantSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1' }}>
                    {step.num}
                  </div>
                  <Trophy size={18} style={{ color: '#22D3EE' }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Voter Flow */}
        <motion.div {...fadeUp} className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.15)' }}>
              <Star size={24} style={{ color: '#22D3EE' }} />
            </div>
            <h2 className="text-3xl font-black">For Voters</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {voterSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: 'rgba(34,211,238,0.15)', color: '#22D3EE' }}>
                    {step.num}
                  </div>
                  <Glasses size={18} style={{ color: '#6366F1' }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-black mb-12 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

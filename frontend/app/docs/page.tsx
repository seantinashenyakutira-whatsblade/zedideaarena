'use client'

import { FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'

const docSections = [
  {
    title: 'Getting Started',
    description: 'New to ZedIdeaArena? Start here to learn the basics.',
    items: [
      { title: 'Creating Your Account', slug: 'creating-account' },
      { title: 'Setting Up Your Profile', slug: 'profile-setup' },
      { title: 'KYC Verification', slug: 'kyc-verification' },
      { title: 'Your First Submission', slug: 'first-submission' },
    ],
  },
  {
    title: 'Submitting Ideas',
    description: 'Learn how to submit and manage your innovative ideas.',
    items: [
      { title: 'Idea Submission Process', slug: 'submission-process' },
      { title: 'Required Information', slug: 'required-info' },
      { title: 'Media Guidelines', slug: 'media-guidelines' },
      { title: 'Best Practices', slug: 'submission-best-practices' },
    ],
  },
  {
    title: 'Competitions',
    description: 'Everything you need to know about participating in competitions.',
    items: [
      { title: 'Finding Competitions', slug: 'finding-competitions' },
      { title: 'Entry Requirements', slug: 'entry-requirements' },
      { title: 'Competition Timeline', slug: 'competition-timeline' },
      { title: 'Winning & Prizes', slug: 'winning-prizes' },
    ],
  },
  {
    title: 'Voting & Community',
    description: 'Support other creators and engage with the community.',
    items: [
      { title: 'How to Vote', slug: 'how-to-vote' },
      { title: 'Commenting on Ideas', slug: 'commenting' },
      { title: 'Building Your Reputation', slug: 'reputation' },
      { title: 'Community Guidelines', slug: 'community-guidelines' },
    ],
  },
  {
    title: 'Payment & Billing',
    description: 'Payment, fees, and billing information.',
    items: [
      { title: 'Payment Methods', slug: 'payment-methods' },
      { title: 'Entry Fees', slug: 'entry-fees' },
      { title: 'Prize Distribution', slug: 'prize-distribution' },
      { title: 'Refund Policy', slug: 'refund-policy' },
    ],
  },
  {
    title: 'Account & Security',
    description: 'Manage your account and ensure your security.',
    items: [
      { title: 'Password Security', slug: 'password-security' },
      { title: 'Two-Factor Authentication', slug: '2fa' },
      { title: 'Data Privacy', slug: 'data-privacy' },
      { title: 'Account Recovery', slug: 'account-recovery' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zed-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-zed-border">
        <div className="container-zed flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zed-gradient-primary" />
            <span className="font-bold text-lg gradient-text">ZedIdeaArena</span>
          </div>
          <Link href="/" className="btn-secondary text-sm">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24">
        <div className="container-zed py-12">
          {/* Header */}
          <div className="max-w-3xl mb-16 animate-zed-fade-up">
            <h1 className="text-5xl font-black text-zed-foreground mb-4">Documentation</h1>
            <p className="text-xl text-zed-foreground-secondary">
              Everything you need to know about ZedIdeaArena. From getting started to becoming a platform expert.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mb-16">
            <div className="relative">
              <input
                type="search"
                placeholder="Search documentation..."
                className="w-full px-6 py-4 rounded-zed-lg bg-zed-surface border border-zed-border text-zed-foreground placeholder:text-zed-foreground-secondary focus:border-zed-primary focus:outline-none transition-all"
              />
              <FileText className="absolute right-4 top-4 text-zed-foreground-secondary" size={20} />
            </div>
          </div>

          {/* Doc Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {docSections.map((section, index) => (
              <div
                key={index}
                className="card-zed-hover group"
              >
                {/* Section Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-zed-foreground mb-2">
                      {section.title}
                    </h2>
                    <p className="text-sm text-zed-foreground-secondary">
                      {section.description}
                    </p>
                  </div>
                  <BookOpen className="text-zed-primary group-hover:text-zed-accent transition-colors" size={24} />
                </div>

                {/* Section Items */}
                <div className="mt-6 space-y-2 pt-6 border-t border-zed-border">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between px-4 py-3 rounded-zed-md"
                    >
                      <span className="text-sm text-zed-foreground-secondary">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="mt-16 card-zed text-center">
            <h3 className="text-2xl font-bold text-zed-foreground mb-3">Still need help?</h3>
            <p className="text-zed-foreground-secondary mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:help@zedideaarena.com" className="btn-primary">
                Contact Support
              </a>
              <a href="mailto:help@zedideaarena.com" className="btn-secondary">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zed-border text-center text-zed-foreground-secondary mt-16">
        <div className="container-zed">
          <p>&copy; 2024 ZedIdeaArena. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

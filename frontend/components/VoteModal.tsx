'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, CheckCircle2, ArrowLeft, ArrowRight, Share2, X, ThumbsUp, Lightbulb, Target, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { voteService } from '@/services/core'

interface VoteModalProps {
  idea: any
  isOpen: boolean
  onClose: () => void
  onVoteComplete: (ideaId: string) => void
}

const steps = [
  { id: 'welcome', title: 'About This Idea' },
  { id: 'innovation', title: 'Rate Innovation' },
  { id: 'impact', title: 'Rate Impact' },
  { id: 'feasibility', title: 'Rate Feasibility' },
  { id: 'review', title: 'Review & Submit' },
]

const ratingLabels = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Great' },
  { value: 5, label: 'Excellent' },
]

export function VoteModal({ idea, isOpen, onClose, onVoteComplete }: VoteModalProps) {
  const [step, setStep] = useState(0)
  const [innovationRating, setInnovationRating] = useState(0)
  const [impactRating, setImpactRating] = useState(0)
  const [feasibilityRating, setFeasibilityRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const canProceed = () => {
    if (step === 1) return innovationRating > 0
    if (step === 2) return impactRating > 0
    if (step === 3) return feasibilityRating > 0
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await voteService.castVoteV2(idea.id, idea.competition_id, {
        innovation_rating: innovationRating,
        impact_rating: impactRating,
        feasibility_rating: feasibilityRating,
        comment,
      })
      setSubmitted(true)
      onVoteComplete(idea.id)
      toast.success('Your vote has been cast!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to cast vote')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pitch/${idea.id}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast.success('Pitch link copied!')).catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }
  }

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    toast.success('Pitch link copied!')
  }

  const renderStars = (rating: number, setRating: (v: number) => void) => (
    <div className="flex items-center gap-3 justify-center">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => setRating(v)}
          className={`p-2 rounded-xl transition-all duration-200 ${
            v <= rating
              ? 'text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'
              : 'text-white/10 hover:text-white/30'
          }`}
        >
          <Star size={40} fill={v <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              {idea.image_url ? (
                <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <Lightbulb size={64} />
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-black text-zed-primary uppercase tracking-widest">
                {idea.industry || idea.category}
              </span>
              <h3 className="text-2xl font-black text-zed-foreground mt-2">{idea.title}</h3>
              <p className="text-sm text-zed-foreground-secondary mt-3 leading-relaxed">
                {idea.problem || idea.problem_statement || idea.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zed-foreground-secondary font-bold">
              <ThumbsUp size={14} />
              <span>{idea.votes_count || 0} votes so far</span>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zed-primary/20 flex items-center justify-center mx-auto">
              <Lightbulb size={40} className="text-zed-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zed-foreground mb-2">Rate Innovation</h3>
              <p className="text-sm text-zed-foreground-secondary">How innovative and creative is this idea?</p>
            </div>
            {renderStars(innovationRating, setInnovationRating)}
            {innovationRating > 0 && (
              <p className="text-sm font-bold text-zed-primary">{ratingLabels.find(r => r.value === innovationRating)?.label}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zed-accent/20 flex items-center justify-center mx-auto">
              <Target size={40} className="text-zed-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zed-foreground mb-2">Rate Impact</h3>
              <p className="text-sm text-zed-foreground-secondary">How impactful and transformative will this idea be?</p>
            </div>
            {renderStars(impactRating, setImpactRating)}
            {impactRating > 0 && (
              <p className="text-sm font-bold text-zed-accent">{ratingLabels.find(r => r.value === impactRating)?.label}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zed-success/20 flex items-center justify-center mx-auto">
              <Eye size={40} className="text-zed-success" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zed-foreground mb-2">Rate Feasibility</h3>
              <p className="text-sm text-zed-foreground-secondary">How feasible and well-planned is this idea?</p>
            </div>
            {renderStars(feasibilityRating, setFeasibilityRating)}
            {feasibilityRating > 0 && (
              <p className="text-sm font-bold text-zed-success">{ratingLabels.find(r => r.value === feasibilityRating)?.label}</p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            {submitted ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-zed-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={56} className="text-zed-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zed-foreground mb-2">Vote Submitted!</h3>
                  <p className="text-sm text-zed-foreground-secondary">Thank you for your vote. Share this pitch to support the creator.</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="btn-primary py-4 px-8 rounded-2xl flex items-center gap-3 mx-auto text-sm font-black"
                >
                  <Share2 size={18} /> Share Pitch Link
                </button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-zed-foreground mb-2">Review Your Vote</h3>
                  <p className="text-sm text-zed-foreground-secondary">Add a comment (optional) and submit</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Innovation', rating: innovationRating, color: 'text-zed-primary' },
                    { label: 'Impact', rating: impactRating, color: 'text-zed-accent' },
                    { label: 'Feasibility', rating: feasibilityRating, color: 'text-zed-success' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">{item.label}</p>
                      <p className={`text-2xl font-black ${item.color}`}>{item.rating}/5</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary flex items-center gap-2">
                    <MessageSquare size={12} /> Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What stood out about this idea?"
                    className="input-zed h-24 resize-none"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-zed-foreground-secondary text-right">{comment.length}/500</p>
                </div>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-[#0A0A0F] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    i === step
                      ? 'bg-zed-primary text-white'
                      : i < step || (step === 4 && submitted)
                      ? 'bg-zed-success/20 text-zed-success'
                      : 'bg-white/5 text-white/30'
                  }`}>
                    {i < step || (step === 4 && submitted) ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-6 h-0.5 ${i < step ? 'bg-zed-success/40' : 'bg-white/5'}`} />
                  )}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-icon text-white/30 hover:text-white/70">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          {step < 4 && !submitted && (
            <div className="flex items-center justify-between p-6 border-t border-white/5">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="btn-secondary px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 disabled:opacity-30"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="text-[10px] text-zed-foreground-secondary font-bold">
                Step {step + 1} of {steps.length - 1}
              </div>
              <button
                onClick={step === 4 ? handleSubmit : handleNext}
                disabled={!canProceed() || submitting}
                className="btn-primary px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 disabled:opacity-30"
              >
                {step === 3 ? 'Review Vote' : 'Next'} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 4 && !submitted && (
            <div className="flex items-center justify-between p-6 border-t border-white/5">
              <button onClick={handleBack} className="btn-secondary px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Vote'} <ThumbsUp size={16} />
              </button>
            </div>
          )}

          {submitted && (
            <div className="p-6 border-t border-white/5">
              <button
                onClick={onClose}
                className="btn-secondary w-full py-3 rounded-xl text-xs font-black"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

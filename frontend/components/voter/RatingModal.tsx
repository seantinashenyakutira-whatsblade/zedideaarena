'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CRITERIA = [
  {
    key: 'innovation_score',
    label: 'Innovation',
    icon: '💡',
    description: 'How original and creative is this idea?',
    hint: '1 = Seen before, 10 = Completely unique'
  },
  {
    key: 'feasibility_score', 
    label: 'Feasibility',
    icon: '⚙️',
    description: 'How realistic is this idea to execute?',
    hint: '1 = Very difficult, 10 = Easily achievable'
  },
  {
    key: 'impact_score',
    label: 'Impact',
    icon: '🌍',
    description: 'How much positive change could this create?',
    hint: '1 = Minimal impact, 10 = Massive impact'
  },
  {
    key: 'presentation_score',
    label: 'Presentation',
    icon: '🎯',
    description: 'How well was the idea communicated?',
    hint: '1 = Unclear, 10 = Crystal clear'
  }
]

interface RatingModalProps {
  idea: any
  onSubmit: (ratings: any) => Promise<void>
  onClose: () => void
}

export function RatingModal({ idea, onSubmit, onClose }: RatingModalProps) {
  const [scores, setScores] = useState({
    innovation_score: 0,
    feasibility_score: 0,
    impact_score: 0,
    presentation_score: 0
  })
  const [comment, setComment] = useState('')
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [timeStart] = useState(Date.now())

  const currentCriteria = CRITERIA[step]
  const allScored = Object.values(scores).every(s => s > 0)
  const avgScore = allScored 
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : '0.0'

  const handleScore = (score: number) => {
    setScores(prev => ({ 
      ...prev, 
      [currentCriteria.key]: score 
    }))
    setTimeout(() => {
      if (step < 3) setStep(step + 1)
      else setStep(4)
    }, 400)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - timeStart) / 1000)
      await onSubmit({ 
        ...scores, 
        comment,
        time_spent_seconds: timeSpent
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {idea && (
        <div className="fixed inset-0 z-50 flex items-center 
                        justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  Rating Idea
                </p>
                <h3 className="font-bold text-lg mt-1 line-clamp-1">
                  {idea.title}
                </h3>
              </div>
              <button onClick={onClose} 
                      className="text-zinc-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <div className="flex gap-1 mb-6">
              {CRITERIA.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all
                  ${i < step || (i === step && scores[CRITERIA[i].key as keyof typeof scores] > 0)
                    ? 'bg-indigo-500' 
                    : i === step ? 'bg-indigo-500/40' : 'bg-zinc-700'
                  }`} 
                />
              ))}
              <div className={`h-1 flex-1 rounded-full transition-all
                ${step >= 4 ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
            </div>

            <AnimatePresence mode="wait">
              {step <= 3 && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-6">
                    <span className="text-4xl">{currentCriteria.icon}</span>
                    <h4 className="font-bold text-xl mt-2">
                      {currentCriteria.label}
                    </h4>
                    <p className="text-secondary text-sm mt-1">
                      {currentCriteria.description}
                    </p>
                    <p className="text-muted text-xs mt-1">
                      {currentCriteria.hint}
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[1,2,3,4,5,6,7,8,9,10].map(score => (
                      <button
                        key={score}
                        onClick={() => handleScore(score)}
                        className={`aspect-square rounded-xl font-bold text-lg
                          transition-all duration-200
                          ${scores[currentCriteria.key as keyof typeof scores] === score
                            ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-muted mt-2">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="comment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-4">
                    <span className="text-4xl">💬</span>
                    <h4 className="font-bold text-xl mt-2">
                      Leave Feedback
                    </h4>
                    <p className="text-secondary text-sm mt-1">
                      Optional — but contestants value your insights
                    </p>
                  </div>

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="What did you think? What could be improved?"
                    maxLength={300}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700
                               rounded-xl p-3 text-sm text-white
                               placeholder-zinc-500 resize-none
                               focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-muted text-right mt-1">
                    {comment.length}/300
                  </p>

                  <button
                    onClick={() => setStep(5)}
                    className="w-full btn-primary mt-4"
                  >
                    Continue →
                  </button>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="text-center mb-4">
                    <span className="text-4xl">✅</span>
                    <h4 className="font-bold text-xl mt-2">Confirm Your Rating</h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    {CRITERIA.map(c => (
                      <div key={c.key} 
                           className="flex justify-between items-center
                                      bg-zinc-800 rounded-xl px-4 py-2">
                        <span className="text-sm text-secondary">
                          {c.icon} {c.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-700 rounded-full">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(scores[c.key as keyof typeof scores] / 10) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-sm w-4">
                            {scores[c.key as keyof typeof scores]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/30
                                  rounded-xl p-4 text-center mb-4">
                    <p className="text-xs text-secondary">Average Score</p>
                    <p className="text-3xl font-black text-indigo-400">
                      {avgScore}
                      <span className="text-base text-muted">/10</span>
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full btn-primary"
                  >
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full text-sm text-muted mt-2 hover:text-white"
                  >
                    ← Go back and edit
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

'use client'
import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import api from '@/lib/api'

const REASONS = [
  'Spam',
  'Harassment or hate speech',
  'Nudity or sexual content',
  'Violence or dangerous content',
  'Misinformation',
  'Impersonation',
  'Copyright violation',
  'Other',
]

interface Props {
  targetType: 'post' | 'comment' | 'message' | 'profile'
  targetId: string
  open: boolean
  onClose: () => void
}

export default function ReportModal({ targetType, targetId, open, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setDescription('')
    setDone(false)
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const submit = async () => {
    if (!reason) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/arena/reports', { target_type: targetType, target_id: targetId, reason, description })
      const data = res.data
      if (data?.status === 'success') {
        setDone(true)
        setTimeout(() => onClose(), 2000)
      } else {
        setError(data?.message || 'Failed to submit report')
      }
    } catch (e: any) {
      setError(e?.data?.message || e?.response?.data?.message || e?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div ref={modalRef} className="bg-zinc-900 border border-white/10 rounded-xl p-5 w-full max-w-md mx-4 shadow-2xl">
        {done ? (
          <div className="text-center py-6">
            <Check size={36} className="mx-auto text-green-400 mb-3" />
            <p className="text-green-400 font-medium">Report submitted. Thanks for helping keep the community safe.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <h3 className="text-white font-bold text-lg">Report {targetType}</h3>
            </div>

            <div className="mb-3">
              <label className="text-white/60 text-xs block mb-1.5">Reason *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/50"
              >
                <option value="">Select a reason...</option>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-white/60 text-xs block mb-1.5">Additional details (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide any extra context..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/50 resize-none h-20 placeholder-white/20"
              />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={submit} disabled={!reason || submitting} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

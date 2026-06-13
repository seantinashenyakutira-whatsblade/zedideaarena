'use client'
import { useState } from 'react'
import { Flag } from 'lucide-react'
import ReportModal from './ReportModal'

interface Props {
  targetType: 'post' | 'comment' | 'message' | 'profile'
  targetId: string
  className?: string
  iconSize?: number
}

export default function ReportButton({ targetType, targetId, className = '', iconSize = 16 }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className={`hover:text-red-400 transition-colors ${className}`} title="Report">
        <Flag size={iconSize} />
      </button>
      <ReportModal targetType={targetType} targetId={targetId} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

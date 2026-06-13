'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCw, Loader2, X, Check } from 'lucide-react'

interface ImageCropperProps {
  src: string
  aspect?: number
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ src, aspect = 1, onCrop, onCancel }: ImageCropperProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => Math.max(0.5, Math.min(5, prev - e.deltaY * 0.005)))
  }, [])

  const applyCrop = useCallback(async () => {
    const img = imageRef.current
    const container = containerRef.current
    if (!img || !container) return

    setProcessing(true)
    const containerRect = container.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = containerRect.width
    canvas.height = containerRect.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight)
    ctx.restore()

    canvas.toBlob(blob => {
      if (blob) onCrop(blob)
      setProcessing(false)
    }, 'image/jpeg', 0.92)
  }, [offset, scale, rotation, onCrop])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-zinc-900 rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-bold">Crop Image</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRotation(r => r - 90)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
              title="Rotate left"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={() => setScale(s => Math.min(5, s + 0.2))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        <div className="relative" style={{ aspectRatio: `${aspect}` }}>
          <div
            ref={containerRef}
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={src}
              alt="Crop preview"
              onLoad={() => setImageLoaded(true)}
              className="select-none pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale}) rotate(${rotation}deg)`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                maxWidth: 'none',
                opacity: imageLoaded ? 1 : 0,
                transition: isDragging ? 'none' : 'opacity 0.2s',
              }}
              draggable={false}
            />
          </div>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-white/30" size={24} />
            </div>
          )}
          <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/20 pointer-events-none" style={{ top: '33.33%' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/20 pointer-events-none" style={{ top: '66.66%' }} />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-white/20 pointer-events-none" style={{ left: '33.33%' }} />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-white/20 pointer-events-none" style={{ left: '66.66%' }} />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-zed-primary"
            />
            <span className="text-xs text-white/40 w-8 text-right">{Math.round(scale * 100)}%</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              onClick={applyCrop}
              disabled={processing || !imageLoaded}
              className="flex-1 py-2.5 rounded-xl bg-zed-primary text-sm font-bold hover:bg-zed-primary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {processing ? 'Processing...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

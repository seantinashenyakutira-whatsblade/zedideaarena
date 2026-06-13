'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  className?: string
}

export function ImageCarousel({ images, className = '' }: ImageCarouselProps) {
  const [idx, setIdx] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())

  if (!images?.length) return null

  const handleError = (i: number) => setErrors(prev => new Set(prev).add(i))

  const renderImage = (src: string, i: number) => {
    if (errors.has(i)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
          <ImageOff size={32} className="text-white/20" />
        </div>
      )
    }
    return (
      <Image
        src={src}
        alt=""
        width={1200}
        height={900}
        className="w-full max-h-96 object-contain bg-black/40"
        unoptimized
        onError={() => handleError(i)}
      />
    )
  }

  if (images.length === 1) {
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`}>
        {renderImage(images[0], 0)}
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden group ${className}`}>
      {renderImage(images[idx], idx)}
      {images.length > 1 && (
        <>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
          {idx > 0 && (
            <button onClick={() => setIdx(idx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft size={18} className="text-white" />
            </button>
          )}
          {idx < images.length - 1 && (
            <button onClick={() => setIdx(idx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight size={18} className="text-white" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

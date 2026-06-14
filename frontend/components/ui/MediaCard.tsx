'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface MediaCardProps {
  src?: string | null
  alt: string
  fallback?: string
  className?: string
  containerClassName?: string
  fill?: boolean
  width?: number
  height?: number
  aspectRatio?: string
}

export function MediaCard({
  src,
  alt,
  fallback,
  className,
  containerClassName,
  fill = true,
  width,
  height,
  aspectRatio = 'aspect-video',
}: MediaCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [grayscale, setGrayscale] = useState(true)

  return (
    <div className={cn(`relative ${aspectRatio} rounded-xl overflow-hidden bg-white/5`, containerClassName)}>
      {!loaded && !error && (
        <Skeleton className="absolute inset-0 rounded-xl" />
      )}
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={cn(
            'object-cover transition-all duration-700',
            grayscale && 'grayscale',
            loaded && 'grayscale-0',
            className
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          onLoad={() => {
            setLoaded(true)
            setTimeout(() => setGrayscale(false), 100)
          }}
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">
            {fallback || 'No Image'}
          </span>
        </div>
      )}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-zed p-0 overflow-hidden', className)}>
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function IdeaCardSkeleton() {
  return (
    <div className="card-zed p-0 overflow-hidden">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

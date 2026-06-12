'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  showControls?: boolean
  autoScroll?: boolean
  pauseOnHover?: boolean
}

export function HorizontalScroll({
  children,
  className = '',
  itemClassName = '',
  showControls = true,
  autoScroll = false,
  pauseOnHover = false,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const itemWidth = scrollRef.current.firstChild ? (scrollRef.current.firstChild as HTMLElement).offsetWidth + 24 : 300
    scrollRef.current.scrollBy({ left: direction === 'left' ? -itemWidth : itemWidth, behavior: 'smooth' })
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.scrollBehavior = 'auto'
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth'
    }
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!autoScroll || isPaused) return
    const interval = setInterval(() => {
      if (!scrollRef.current || isDragging) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft >= scrollWidth - clientWidth - 1) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const itemWidth = scrollRef.current.firstChild ? (scrollRef.current.firstChild as HTMLElement).offsetWidth + 24 : 300
        scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [autoScroll, isPaused, isDragging])

  return (
    <div className="relative">
      {showControls && (
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => scrollBy('left')}
            className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-all ${canScrollLeft ? 'opacity-100 hover:bg-white/10 hover:border-white/20' : 'opacity-30 cursor-default'}`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy('right')}
            className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-all ${canScrollRight ? 'opacity-100 hover:bg-white/10 hover:border-white/20' : 'opacity-30 cursor-default'}`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        className={
          `flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`
        }
      >
        {children}
      </div>
    </div>
  )
}
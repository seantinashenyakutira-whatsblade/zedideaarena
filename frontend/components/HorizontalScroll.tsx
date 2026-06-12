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
  wheelScroll?: boolean
  wheelScrollSpeed?: number
}

export function HorizontalScroll({
  children,
  className = '',
  itemClassName = '',
  showControls = true,
  autoScroll = false,
  pauseOnHover = false,
  wheelScroll = true,
  wheelScrollSpeed = 1.5,
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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') scrollBy('left')
      if (e.key === 'ArrowRight') scrollBy('right')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Wheel scroll - translate vertical to horizontal
  const handleWheel = (e: React.WheelEvent) => {
    if (!wheelScroll || !scrollRef.current) return
    
    // Only intercept vertical scrolling
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
      
      const scrollContainer = scrollRef.current
      const scrollAmount = e.deltaY * wheelScrollSpeed
      
      // Smooth scroll with requestAnimationFrame for natural feel
      let startTime: number
      const startScroll = scrollContainer.scrollLeft
      const targetScroll = startScroll + scrollAmount
      
      const animateScroll = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const duration = 200 // ms
        
        const progress = Math.min(elapsed / duration, 1)
        // Easing function for natural feel
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        scrollContainer.scrollLeft = startScroll + (targetScroll - startScroll) * easeOut
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }
      
      requestAnimationFrame(animateScroll)
    }
  }
  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.scrollBehavior = 'auto'
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.touches[0].clientX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
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
            className={`w-12 h-12 rounded-full flex items-center justify-center 
              border-2 border-white/20 bg-white/5 backdrop-blur-md
              transition-all duration-300 ease-out
              hover:bg-white/10 hover:border-white/40 hover:scale-110
              active:scale-95 shadow-lg hover:shadow-xl
              ${canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
            `}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={() => scrollBy('right')}
            className={`w-12 h-12 rounded-full flex items-center justify-center 
              border-2 border-white/20 bg-white/5 backdrop-blur-md
              transition-all duration-300 ease-out
              hover:bg-white/10 hover:border-white/40 hover:scale-110
              active:scale-95 shadow-lg hover:shadow-xl
              ${canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
            `}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} className="text-white" />
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        className={
          `flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`
        }
      >
        {children}
      </div>

      {/* Visual scroll indicator */}
      <div className="flex justify-end gap-1 mt-4 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full transition-all duration-300
              ${i === 0 ? 'bg-white/60' : 'bg-white/20'}
            `}
          />
        ))}
      </div>
    </div>
  )
}
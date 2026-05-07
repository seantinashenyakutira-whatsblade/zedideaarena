'use client'

import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef } from 'react'

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    // In a real app, send OTP to backend
  }

  const handleResend = () => {
    setTimer(60)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-zed-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center gap-3 justify-center floating">
              <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
              <span className="font-bold text-2xl gradient-text tracking-tighter">ZedIdeaArena</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Verify Your Email</h1>
          <p className="text-zed-foreground-secondary">We&apos;ve sent a code to your email. Enter it below.</p>
        </div>

        {/* OTP Card */}
        <div className="card-zed mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-4">
                Verification Code
              </label>
              <div className="flex gap-3 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-zed-md bg-zed-surface border-2 border-zed-border text-zed-foreground focus:border-zed-primary focus:outline-none transition-all duration-300"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            {/* Resend Code */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zed-foreground-secondary">
                Didn&apos;t receive the code?
              </span>
              {timer > 0 ? (
                <div className="flex items-center gap-1 text-zed-primary">
                  <Clock size={16} />
                  <span>{timer}s</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-zed-primary hover:underline font-medium"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Verify <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-zed-foreground-secondary">
          Having trouble?{' '}
          <a href="mailto:support@zedideaarena.com" className="text-zed-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}

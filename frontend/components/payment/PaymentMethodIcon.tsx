'use client'

import Image from 'next/image'

interface PaymentMethodIconProps {
  icon: string
  name: string
  size?: number
  className?: string
}

const iconPath: Record<string, string> = {
  mtn: '/assets/payment-icons/mtn.svg',
  airtel: '/assets/payment-icons/airtel.svg',
  mpesa: '/assets/payment-icons/mpesa.svg',
  tigo: '/assets/payment-icons/tigo.svg',
  visa: '/assets/payment-icons/visa.svg',
  mastercard: '/assets/payment-icons/mastercard.svg',
  card: '/assets/payment-icons/visa.svg',
}

export function PaymentMethodIcon({ icon, name, size = 32, className = '' }: PaymentMethodIconProps) {
  const src = iconPath[icon] || iconPath['card']
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-white/10 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={name}
        width={size * 0.7}
        height={size * 0.7}
        className="object-contain"
        style={{ maxWidth: '70%', maxHeight: '70%' }}
      />
    </div>
  )
}

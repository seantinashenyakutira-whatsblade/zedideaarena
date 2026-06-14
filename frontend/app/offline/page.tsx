import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} className="text-white/40" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">You&apos;re Offline</h1>
        <p className="text-sm text-white/50 mb-8 leading-relaxed">
          Check your internet connection and try again. Some cached content may still be available.
        </p>
        <div className="space-y-3">
          <Link href="/" className="block w-full px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold text-center hover:bg-indigo-500/80 transition-colors">
            Try Home Page
          </Link>
        </div>
      </div>
    </div>
  )
}

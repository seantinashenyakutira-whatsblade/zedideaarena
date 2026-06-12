import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zed-background px-4 text-center">
      <div className="mb-6 text-6xl">📡</div>
      <h1 className="mb-2 text-2xl font-bold text-white">You&apos;re Offline</h1>
      <p className="mb-8 max-w-md text-zed-muted">
        Check your connection and try again. Some pages may be available offline.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zed-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-zed-primary/80"
      >
        Go Home
      </Link>
    </div>
  )
}

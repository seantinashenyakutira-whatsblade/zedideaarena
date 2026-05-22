export default function RootLoading() {
  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-zed-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-zed-foreground-secondary font-bold text-sm uppercase tracking-widest">Loading Arena...</p>
      </div>
    </div>
  )
}

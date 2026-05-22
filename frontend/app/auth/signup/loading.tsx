export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-pulse">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4" />
          <div className="h-8 w-48 bg-white/5 rounded-2xl mx-auto mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded-xl mx-auto" />
        </div>
        <div className="card-zed space-y-4">
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  )
}

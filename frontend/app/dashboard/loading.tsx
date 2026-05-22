export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-zed-background">
      <div className="w-64 bg-black/30 animate-pulse" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-black/20 animate-pulse" />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="h-10 w-64 bg-white/5 rounded-2xl mb-2 animate-pulse" />
            <div className="h-5 w-48 bg-white/5 rounded-xl mb-8 animate-pulse" />
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-zed h-32 animate-pulse" />
              ))}
            </div>
            <div className="card-zed h-96 animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  )
}

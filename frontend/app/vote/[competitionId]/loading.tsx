export default function VoteLoading() {
  return (
    <div className="flex h-screen bg-zed-background">
      <div className="w-64 bg-black/30 animate-pulse" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-black/20 animate-pulse" />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 w-96 bg-white/5 rounded-2xl mb-8 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-zed animate-pulse">
                  <div className="aspect-video bg-white/5 rounded-xl mb-6" />
                  <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-3" />
                  <div className="h-4 w-1/2 bg-white/5 rounded-lg mb-6" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

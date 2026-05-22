export default function CompetitionDetailLoading() {
  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-16">
        <div className="h-4 w-40 bg-white/5 rounded-lg mb-8 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-white/5 rounded-3xl mb-8 animate-pulse" />
            <div className="h-10 w-3/4 bg-white/5 rounded-2xl mb-4 animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div>
            <div className="card-zed p-8 animate-pulse">
              <div className="h-4 w-16 bg-white/5 rounded-lg mb-6" />
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg" />
                  <div>
                    <div className="h-3 w-16 bg-white/5 rounded mb-1" />
                    <div className="h-8 w-24 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg" />
                  <div>
                    <div className="h-3 w-16 bg-white/5 rounded mb-1" />
                    <div className="h-6 w-20 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

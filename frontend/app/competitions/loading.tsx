export default function CompetitionsLoading() {
  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-16">
        <div className="mb-12 text-center">
          <div className="h-12 w-96 bg-white/5 rounded-2xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-white/5 rounded-xl mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-zed animate-pulse">
              <div className="aspect-video bg-white/5 rounded-xl mb-6" />
              <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-3" />
              <div className="h-4 w-full bg-white/5 rounded-lg mb-2" />
              <div className="h-4 w-2/3 bg-white/5 rounded-lg mb-6" />
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-white/5 rounded-lg" />
                <div className="h-4 w-20 bg-white/5 rounded-lg" />
                <div className="h-4 w-20 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

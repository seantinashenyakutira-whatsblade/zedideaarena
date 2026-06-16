import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Navbar />
      <main className="pt-16"> {/* Offset for fixed navbar */}
        {children}
      </main>
      <Footer />
    </div>
  )
}

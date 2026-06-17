"use client"

import Navbar from "./Navbar"
import Footer from "./Footer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-body)" }}>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  )
}

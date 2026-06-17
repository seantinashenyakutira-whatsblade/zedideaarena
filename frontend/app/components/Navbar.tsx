"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Zap, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeProvider"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { resolved, toggle } = useTheme()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/arena", label: "Arena" },
    { href: "/competitions", label: "Competitions" },
    { href: "/leaderboard", label: "Leaderboard" },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: "var(--nav-bg)",
        borderColor: "var(--nav-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ background: "var(--gradient-accent)" }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold group-hover:opacity-80 transition-opacity duration-300"
              style={{ color: "var(--text-primary)" }}
            >
              Zedidea
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)"
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg transition-all duration-300"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)"
                e.currentTarget.style.backgroundColor = "var(--surface-hover)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)"
                e.currentTarget.style.backgroundColor = "var(--surface)"
              }}
            >
              {resolved === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Sign In
            </button>

            <button
              className="px-5 py-2.5 text-sm font-bold text-white rounded-lg transition-all duration-300 hover:scale-105"
              style={{ background: "var(--gradient-accent)" }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--nav-border)",
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)"
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile theme toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300"
              style={{ color: "var(--text-secondary)" }}
            >
              {resolved === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {resolved === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <div
              className="pt-4 mt-4 space-y-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                className="w-full px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign In
              </button>
              <button
                className="w-full px-5 py-2.5 text-sm font-bold text-white rounded-lg"
                style={{ background: "var(--gradient-accent)" }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

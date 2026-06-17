"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Competitions", href: "/competitions" },
      { label: "Arena", href: "/arena" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  }

  const linkStyle = {
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
    transition: "color 0.3s ease",
  }

  const sectionTitle = {
    color: "var(--text-primary)",
    fontWeight: 600,
    marginBottom: "1rem",
  }

  return (
    <footer style={{ backgroundColor: "var(--footer-bg)", borderTop: "1px solid var(--footer-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-accent)" }}
              >
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Zedidea
              </span>
            </Link>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Where ideas compete and creativity shines.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text-secondary)",
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
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 style={sectionTitle}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--footer-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            &copy; {currentYear} Zedidea. All rights reserved.
          </p>
          <p
            className="text-sm flex items-center gap-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Made with <Heart className="w-4 h-4" style={{ color: "#ef4444", fill: "#ef4444" }} /> for
            creators everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

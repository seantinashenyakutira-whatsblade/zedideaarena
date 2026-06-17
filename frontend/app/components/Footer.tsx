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

  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">Zedidea</span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Where ideas compete and creativity shines.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-secondary)] text-sm">
            © {currentYear} Zedidea. All rights reserved.
          </p>
          <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for creators everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

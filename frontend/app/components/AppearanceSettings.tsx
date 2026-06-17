"use client"

import { useState } from "react"
import { Sun, Moon, Monitor, Settings, Check } from "lucide-react"
import { useTheme, type ThemeMode } from "../context/ThemeProvider"

export default function AppearanceSettings() {
  const [open, setOpen] = useState(false)
  const { mode, setMode } = useTheme()

  const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-lg transition-all duration-300"
        style={{
          color: "var(--text-secondary)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.backgroundColor = "var(--surface-hover)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "var(--surface)" }}
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Menu */}
          <div
            className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-xl overflow-hidden shadow-xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Appearance</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Choose your theme</p>
            </div>

            {/* Options */}
            <div className="p-1.5 space-y-0.5">
              {options.map((opt) => {
                const Icon = opt.icon
                const active = mode === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setMode(opt.value); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: active ? "var(--surface-hover)" : "transparent",
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "var(--surface-hover)" }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: active ? "var(--color-primary-500)" : "var(--text-muted)" }} />
                    <span className="flex-1 text-left">{opt.label}</span>
                    {active && <Check className="w-4 h-4" style={{ color: "var(--color-primary-500)" }} />}
                  </button>
                )
              })}
            </div>

            {/* Hint */}
            <div className="px-4 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {mode === "system"
                  ? "Follows your device theme"
                  : mode === "dark"
                  ? "Dark mode active"
                  : "Light mode active"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

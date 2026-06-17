"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "dark" | "light"
type ThemeContext = { theme: Theme; toggle: () => void; resolved: Theme }

const ThemeCtx = createContext<ThemeContext>({
  theme: "dark",
  toggle: () => {},
  resolved: "dark",
})

export function useTheme() {
  return useContext(ThemeCtx)
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [resolved, setResolved] = useState<Theme>("dark")

  // Apply theme to <html>
  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    root.setAttribute("data-theme", t)
    root.classList.remove("theme-transitioning")

    // Force reflow then enable transitions for smooth switch
    root.classList.add("theme-transitioning")
    void root.offsetHeight
    setTimeout(() => root.classList.remove("theme-transitioning"), 400)

    // Tailwind dark mode
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [])

  // Init on mount
  useEffect(() => {
    const stored = localStorage.getItem("zedidea-theme") as Theme | null
    const sys = getSystemTheme()
    const initial = stored || sys
    setTheme(initial)
    setResolved(initial)
    applyTheme(initial)
  }, [applyTheme])

  // Listen to system preference changes (only when no manual override)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("zedidea-theme")
      if (!stored) {
        const sys = e.matches ? "light" : "dark"
        setTheme(sys)
        setResolved(sys)
        applyTheme(sys)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [applyTheme])

  const toggle = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark"
    setTheme(next)
    setResolved(next)
    localStorage.setItem("zedidea-theme", next)
    applyTheme(next)
  }, [resolved, applyTheme])

  return (
    <ThemeCtx.Provider value={{ theme, toggle, resolved }}>
      {children}
    </ThemeCtx.Provider>
  )
}

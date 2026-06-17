"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export type ThemeMode = "dark" | "light" | "system"
export type Theme = "dark" | "light"

type ThemeContext = {
  mode: ThemeMode
  resolved: Theme
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeCtx = createContext<ThemeContext>({
  mode: "system",
  resolved: "dark",
  setMode: () => {},
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeCtx)
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.setAttribute("data-theme", t)
  root.classList.remove("theme-transitioning")
  root.classList.add("theme-transitioning")
  void root.offsetHeight
  setTimeout(() => root.classList.remove("theme-transitioning"), 400)
  if (t === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

function resolveMode(mode: ThemeMode): Theme {
  if (mode === "system") return getSystemTheme()
  return mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system")
  const [resolved, setResolved] = useState<Theme>("dark")

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem("zedidea-theme", m)
    const r = resolveMode(m)
    setResolved(r)
    applyTheme(r)
  }, [])

  // Init on mount
  useEffect(() => {
    const stored = localStorage.getItem("zedidea-theme") as ThemeMode | null
    const initial = stored || "system"
    setModeState(initial)
    const r = resolveMode(initial)
    setResolved(r)
    applyTheme(r)
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("zedidea-theme") as ThemeMode | null
      if (!stored || stored === "system") {
        const sys: Theme = e.matches ? "light" : "dark"
        setResolved(sys)
        applyTheme(sys)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const toggle = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark"
    setMode(next)
  }, [resolved, setMode])

  return (
    <ThemeCtx.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export type ThemeMode = "system" | "light" | "dark"

type ThemeCtx = {
  mode: ThemeMode
  setTheme: (m: ThemeMode) => void
  resolved: "dark" | "light"
}

const Ctx = createContext<ThemeCtx>({ mode: "system", setTheme: () => {}, resolved: "dark" })

export function useTheme() { return useContext(Ctx) }

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function apply(t: "dark" | "light") {
  const r = document.documentElement
  r.setAttribute("data-theme", t)
  if (t === "dark") r.classList.add("dark"); else r.classList.remove("dark")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system")
  const [resolved, setResolved] = useState<"dark" | "light">("dark")

  const setTheme = useCallback((m: ThemeMode) => {
    setMode(m)
    localStorage.setItem("zedidea-theme", m)
    const r = m === "system" ? getSystemTheme() : m
    setResolved(r)
    apply(r)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("zedidea-theme") as ThemeMode | null
    const m = stored || "system"
    setMode(m)
    const r = m === "system" ? getSystemTheme() : m
    setResolved(r)
    apply(r)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = () => {
      const stored = localStorage.getItem("zedidea-theme") as ThemeMode | null
      if (!stored || stored === "system") {
        const r = getSystemTheme()
        setResolved(r)
        apply(r)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return <Ctx.Provider value={{ mode, setTheme, resolved }}>{children}</Ctx.Provider>
}

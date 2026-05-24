"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getThemeSettings, saveThemeSettings } from "@/lib/settings-actions"
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "@/lib/settings"

interface ThemeContextType {
  settings: ThemeSettings
  updateSettings: (partial: Partial<ThemeSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  applySettings: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, orgId }: { children: React.ReactNode; orgId?: string }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      const loaded = await getThemeSettings(orgId)
      setSettings(loaded)
      applyThemeToDOM(loaded)
      setIsLoading(false)
    }
    loadSettings()
  }, [orgId])

  const updateSettings = async (partial: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...partial }
    setSettings(updated)
    applyThemeToDOM(updated)
    await saveThemeSettings(updated, orgId)
  }

  const resetSettings = async () => {
    setSettings(DEFAULT_THEME_SETTINGS)
    applyThemeToDOM(DEFAULT_THEME_SETTINGS)
    await saveThemeSettings(DEFAULT_THEME_SETTINGS, orgId)
  }

  const applySettings = () => {
    applyThemeToDOM(settings)
  }

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resetSettings, applySettings }}>
      {!isLoading && children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

function applyThemeToDOM(theme: ThemeSettings) {
  const root = document.documentElement

  root.style.setProperty("--background", theme.background)
  root.style.setProperty("--foreground", theme.foreground)
  root.style.setProperty("--card", theme.card)
  root.style.setProperty("--card-foreground", theme.cardForeground)
  root.style.setProperty("--primary", theme.primary)
  root.style.setProperty("--primary-foreground", theme.primaryForeground)
  root.style.setProperty("--secondary", theme.secondary)
  root.style.setProperty("--secondary-foreground", theme.secondaryForeground)
  root.style.setProperty("--accent", theme.accent)
  root.style.setProperty("--accent-foreground", theme.accentForeground)
  root.style.setProperty("--destructive", theme.destructive)
  root.style.setProperty("--border", theme.border)
  root.style.setProperty("--ring", theme.ring)

  root.style.setProperty("--base-font-size", `${theme.baseFontSize}rem`)
  root.style.setProperty("--heading-font-size", `${theme.headingFontSize}rem`)
  root.style.setProperty("--mono-font-size", `${theme.monoFontSize}rem`)

  root.style.setProperty("--radius", `${theme.radius}rem`)
}

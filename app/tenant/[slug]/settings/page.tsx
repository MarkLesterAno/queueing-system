"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useTheme } from "@/context/theme-context"
import AdminSidebar from "@/components/admin-sidebar"
import { RotateCcw, Save } from "lucide-react"
import { motion } from "framer-motion"

const COLOR_PRESETS = [
  { name: "Dark", bg: "#0A0A0A", fg: "#F0EDE8", primary: "#F5A623" },
  { name: "Light", bg: "#FFFFFF", fg: "#0A0A0A", primary: "#2563EB" },
  { name: "Purple", bg: "#1A0A2E", fg: "#D8BFD8", primary: "#8A2BE2" },
  { name: "Ocean", bg: "#0B1929", fg: "#C9D6FF", primary: "#00A8E8" },
]

export default function SettingsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { settings, updateSettings, resetSettings } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaved(true)
    setIsSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = async () => {
    if (confirm("Reset all settings to defaults?")) {
      await resetSettings()
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 border-b border-border bg-background/95 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-mono text-lg uppercase tracking-widest text-foreground">Theme Settings</h1>
              <p className="font-sans text-sm text-muted-foreground mt-1">Customize colors, fonts, and appearance</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border text-muted-foreground font-mono text-xs uppercase tracking-widest hover:border-destructive hover:text-destructive transition-colors">
                <RotateCcw size={16} /> Reset
              </button>
              <motion.button onClick={handleSave} disabled={isSaving}
                animate={saved ? { backgroundColor: "#F5A623" } : {}}
                className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-colors">
                <Save size={16} /> {saved ? "Saved" : isSaving ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                {/* Color Presets */}
                <section className="space-y-4">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Preset Themes</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button key={preset.name} onClick={() =>
                        updateSettings({ background: preset.bg, foreground: preset.fg, primary: preset.primary, primaryForeground: preset.bg })
                      }
                        className="flex items-center gap-3 p-4 border border-border rounded-sm hover:bg-secondary transition-colors text-left">
                        <div className="flex gap-2">
                          <div className="h-8 w-8 rounded-sm border" style={{ backgroundColor: preset.bg, borderColor: preset.fg }} />
                          <div className="h-8 w-8 rounded-sm" style={{ backgroundColor: preset.primary }} />
                        </div>
                        <span className="font-mono text-sm text-foreground">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Colors */}
                <section className="space-y-4">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Colors</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "background" as const, label: "Background" },
                      { key: "foreground" as const, label: "Foreground" },
                      { key: "primary" as const, label: "Primary" },
                      { key: "secondary" as const, label: "Secondary" },
                      { key: "accent" as const, label: "Accent" },
                      { key: "destructive" as const, label: "Destructive" },
                      { key: "border" as const, label: "Border" },
                      { key: "ring" as const, label: "Ring" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex flex-col gap-2">
                        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
                        <div className="flex gap-2">
                          <div className="h-10 w-16 rounded-sm border border-border cursor-pointer"
                            style={{ backgroundColor: settings[key] as string }}
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "color"
                              input.value = settings[key] as string
                              input.onchange = (e) => updateSettings({ [key]: (e.target as HTMLInputElement).value })
                              input.click()
                            }} />
                          <input type="text" value={settings[key] as string}
                            onChange={(e) => updateSettings({ [key]: e.target.value })}
                            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Font Sizes */}
                <section className="space-y-4">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Font Sizes</h2>
                  <div className="space-y-4">
                    {[
                      { key: "baseFontSize" as const, label: "Base Font Size", step: 0.1, min: 0.75, max: 1.5 },
                      { key: "headingFontSize" as const, label: "Heading Font Size", step: 0.1, min: 1, max: 2.5 },
                      { key: "monoFontSize" as const, label: "Mono Font Size", step: 0.1, min: 0.75, max: 1.5 },
                    ].map(({ key, label, step, min, max }) => (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
                          <span className="font-mono text-sm text-foreground">{(settings[key] as number).toFixed(2)}rem</span>
                        </div>
                        <input type="range" min={min} max={max} step={step} value={settings[key] as number}
                          onChange={(e) => updateSettings({ [key]: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-secondary rounded-sm appearance-none cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Radius */}
                <section className="space-y-4">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Border Radius</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Radius</span>
                      <span className="font-mono text-sm text-foreground">{settings.radius.toFixed(3)}rem</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={settings.radius}
                      onChange={(e) => updateSettings({ radius: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-secondary rounded-sm appearance-none cursor-pointer" />
                  </div>
                </section>
              </div>

              {/* Live Preview */}
              <div className="sticky top-24 h-fit">
                <div className="border border-border rounded-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-secondary/30">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-foreground">Live Preview</h3>
                  </div>
                  <div className="p-6 space-y-4" style={{ backgroundColor: settings.background }}>
                    <div style={{ fontSize: `${settings.headingFontSize}rem`, color: settings.foreground }}>
                      <h4 className="font-bold">Preview Heading</h4>
                    </div>
                    <p style={{ color: settings.foreground }}>Regular body text with current font size settings applied.</p>
                    <div style={{ fontSize: `${settings.monoFontSize}rem`, color: settings.foreground, fontFamily: "monospace" }}>
                      Monospace: ABC-001
                    </div>
                    <div className="space-y-2 pt-4">
                      <button style={{ backgroundColor: settings.primary, color: settings.primaryForeground, borderRadius: `${settings.radius}rem` }}
                        className="w-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-opacity hover:opacity-90">
                        Primary Button
                      </button>
                      <button style={{ backgroundColor: settings.secondary, color: settings.secondaryForeground, borderRadius: `${settings.radius}rem`, border: `1px solid ${settings.border}` }}
                        className="w-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-opacity hover:opacity-90">
                        Secondary Button
                      </button>
                    </div>
                    <div style={{ backgroundColor: settings.card, color: settings.cardForeground, borderRadius: `${settings.radius}rem`, border: `1px solid ${settings.border}` }}
                      className="p-4 space-y-2">
                      <h5 className="font-bold text-sm">Card Preview</h5>
                      <p className="text-xs opacity-75">Card styling with custom colors and radius.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

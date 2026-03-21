"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/context/theme-context"
import { DARK_THEME, LIGHT_THEME } from "@/lib/settings"
import { Settings, X } from "lucide-react"

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-sm border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-2"
      >
        <Settings size={14} />
        Settings
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings, updateSettings, resetSettings } = useTheme()
  const [activeTab, setActiveTab] = useState<"theme" | "layout" | "effects">("theme")
  const [saving, setSaving] = useState(false)

  const handleColorChange = (key: keyof typeof settings, value: string) => {
    updateSettings({ ...settings, [key]: value })
  }

  const handlePreset = (preset: typeof DARK_THEME) => {
    updateSettings(preset)
  }

  const handleReset = async () => {
    if (confirm("Reset all settings to default?")) {
      setSaving(true)
      await resetSettings()
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-sm max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                <span className="font-mono text-sm uppercase tracking-widest text-foreground">
                  Theme Settings
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Tabs */}
              <div className="w-48 border-r border-border flex flex-col">
                <div className="p-4 space-y-2">
                  {[
                    { id: "theme", label: "Color Scheme" },
                    { id: "layout", label: "Layout" },
                    { id: "effects", label: "Effects" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-sm text-sm font-mono transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-auto p-4 border-t border-border space-y-2">
                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="w-full px-3 py-2 rounded-sm text-xs font-mono uppercase tracking-widest border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "theme" && <ThemePanel theme={settings} onColorChange={handleColorChange} onPreset={handlePreset} />}
                {activeTab === "layout" && <LayoutPanel theme={settings} onUpdate={updateSettings} />}
                {activeTab === "effects" && <EffectsPanel theme={settings} onUpdate={updateSettings} />}
              </div>

              {/* Live Preview */}
              <div className="w-64 border-l border-border bg-secondary/20 p-4 overflow-y-auto">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                  Preview
                </span>
                <PreviewPanel theme={settings} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ThemePanel({
  theme,
  onColorChange,
  onPreset,
}: {
  theme: any
  onColorChange: (key: string, value: string) => void
  onPreset: (preset: any) => void
}) {
  const colorGroups = [
    {
      label: "Base Colors",
      colors: [
        { key: "background", label: "Background" },
        { key: "foreground", label: "Foreground" },
      ],
    },
    {
      label: "Component Colors",
      colors: [
        { key: "card", label: "Card Background" },
        { key: "cardForeground", label: "Card Text" },
        { key: "secondary", label: "Secondary" },
        { key: "secondaryForeground", label: "Secondary Text" },
      ],
    },
    {
      label: "Interactive Colors",
      colors: [
        { key: "primary", label: "Primary" },
        { key: "primaryForeground", label: "Primary Text" },
        { key: "accent", label: "Accent" },
        { key: "accentForeground", label: "Accent Text" },
      ],
    },
    {
      label: "UI Colors",
      colors: [
        { key: "destructive", label: "Destructive" },
        { key: "border", label: "Border" },
        { key: "ring", label: "Focus Ring" },
        { key: "muted", label: "Muted" },
        { key: "mutedForeground", label: "Muted Text" },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Presets */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Quick Presets
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => onPreset(DARK_THEME)}
            className="flex-1 px-3 py-2 rounded-sm bg-[#0A0A0A] text-[#F0EDE8] font-mono text-xs uppercase tracking-widest border-2 border-transparent hover:border-primary transition-colors"
          >
            Dark
          </button>
          <button
            onClick={() => onPreset(LIGHT_THEME)}
            className="flex-1 px-3 py-2 rounded-sm bg-[#FFFFFF] text-[#0A0A0A] font-mono text-xs uppercase tracking-widest border-2 border-transparent hover:border-primary transition-colors"
          >
            Light
          </button>
        </div>
      </div>

      {/* Color Groups */}
      {colorGroups.map((group) => (
        <div key={group.label}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {group.colors.map((color) => (
              <div key={color.key} className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground">
                  {color.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme[color.key]}
                    onChange={(e) => onColorChange(color.key, e.target.value)}
                    className="h-10 w-12 rounded-sm cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={theme[color.key]}
                    onChange={(e) => onColorChange(color.key, e.target.value)}
                    className="flex-1 px-2 py-1 rounded-sm bg-secondary border border-border font-mono text-xs text-foreground"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function LayoutPanel({
  theme,
  onUpdate,
}: {
  theme: any
  onUpdate: (updated: any) => Promise<void>
}) {
  const handleChange = async (key: string, value: number) => {
    await onUpdate({ ...theme, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Base Font Size: {theme.baseFontSize}rem
        </label>
        <input
          type="range"
          min="0.75"
          max="1.25"
          step="0.05"
          value={theme.baseFontSize}
          onChange={(e) => handleChange("baseFontSize", Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Heading Font Size: {theme.headingFontSize}rem
        </label>
        <input
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={theme.headingFontSize}
          onChange={(e) => handleChange("headingFontSize", Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Monospace Font Size: {theme.monoFontSize}rem
        </label>
        <input
          type="range"
          min="0.7"
          max="1"
          step="0.05"
          value={theme.monoFontSize}
          onChange={(e) => handleChange("monoFontSize", Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Border Radius: {theme.radius}rem
        </label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          value={theme.radius}
          onChange={(e) => handleChange("radius", Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Spacing Scale: {theme.spacing}rem
        </label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={theme.spacing}
          onChange={(e) => handleChange("spacing", Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}

function EffectsPanel({
  theme,
  onUpdate,
}: {
  theme: any
  onUpdate: (updated: any) => Promise<void>
}) {
  const handleChange = async (value: number) => {
    await onUpdate({ ...theme, opacity: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Opacity: {Math.round(theme.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.05"
          value={theme.opacity}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full"
        />
        <p className="font-mono text-[10px] text-muted-foreground mt-2">
          Controls overall interface transparency
        </p>
      </div>
    </div>
  )
}

function PreviewPanel({ theme }: { theme: any }) {
  return (
    <div
      className="space-y-3"
      style={{
        "--preview-bg": theme.background,
        "--preview-fg": theme.foreground,
        "--preview-card": theme.card,
        "--preview-primary": theme.primary,
        "--preview-secondary": theme.secondary,
      } as any}
    >
      <div
        className="p-2 rounded text-xs font-mono uppercase"
        style={{
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
        }}
      >
        Primary Button
      </div>

      <div
        className="p-2 rounded text-xs font-mono uppercase"
        style={{
          backgroundColor: theme.secondary,
          color: theme.secondaryForeground,
          border: `1px solid ${theme.border}`,
        }}
      >
        Secondary Button
      </div>

      <div
        className="p-3 rounded"
        style={{
          backgroundColor: theme.card,
          color: theme.cardForeground,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="font-mono text-[10px] uppercase tracking-widest mb-2">Card Element</div>
        <div className="text-[11px]">
          Sample text with current theme colors
        </div>
      </div>

      <div
        className="p-2 rounded text-xs"
        style={{
          backgroundColor: theme.destructive,
          color: "#FFFFFF",
        }}
      >
        Destructive
      </div>
    </div>
  )
}

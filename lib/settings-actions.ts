"use server"

import { redis } from "@/lib/redis"
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "@/lib/settings"

const SETTINGS_KEY = "system:theme-settings"

export async function getThemeSettings(): Promise<ThemeSettings> {
  const stored = await redis.get<ThemeSettings>(SETTINGS_KEY)
  return stored || DEFAULT_THEME_SETTINGS
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<boolean> {
  try {
    await redis.set(SETTINGS_KEY, settings)
    return true
  } catch (err) {
    console.error("[v0] Failed to save theme settings:", err)
    return false
  }
}

export async function resetThemeSettings(): Promise<boolean> {
  try {
    await redis.del(SETTINGS_KEY)
    return true
  } catch (err) {
    console.error("[v0] Failed to reset theme settings:", err)
    return false
  }
}

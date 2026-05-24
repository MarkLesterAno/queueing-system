"use server"

import { createClient } from "@/lib/supabase/server"
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "@/lib/settings"

export async function getThemeSettings(orgId?: string): Promise<ThemeSettings> {
  const supabase = await createClient()
  if (!orgId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return DEFAULT_THEME_SETTINGS
    const { data: userData } = await supabase
      .from("users")
      .select("org_id")
      .eq("email", user.email)
      .single()
    if (!userData) return DEFAULT_THEME_SETTINGS
    orgId = userData.org_id
  }
  const { data } = await supabase
    .from("org_settings")
    .select("settings")
    .eq("org_id", orgId)
    .single()
  if (!data?.settings) return DEFAULT_THEME_SETTINGS
  return { ...DEFAULT_THEME_SETTINGS, ...data.settings } as ThemeSettings
}

export async function saveThemeSettings(settings: ThemeSettings, orgId?: string): Promise<boolean> {
  const supabase = await createClient()
  if (!orgId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: userData } = await supabase
      .from("users")
      .select("org_id")
      .eq("email", user.email)
      .single()
    if (!userData) return false
    orgId = userData.org_id
  }
  const { error } = await supabase
    .from("org_settings")
    .upsert({ org_id: orgId, settings }, { onConflict: "org_id" })
  return !error
}

export async function resetThemeSettings(orgId?: string): Promise<boolean> {
  return saveThemeSettings(DEFAULT_THEME_SETTINGS, orgId)
}

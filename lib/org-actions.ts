"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getOrgBySlug(slug: string) {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", slug)
    .single()
  if (error) console.error("[v0] getOrgBySlug error:", error)
  return data
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single()
  if (error && error.code !== "PGRST116") console.error("[v0] checkSlugAvailable error:", error)
  return !data
}

export async function createOrganization(
  slug: string,
  name: string,
  adminEmail: string,
  adminPassword: string,
) {
  const serviceClient = await createServiceClient()

  const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  })
  if (authError) return { error: authError.message }

  const { data: org, error: orgError } = await serviceClient
    .from("organizations")
    .insert({ slug, name })
    .select("id, slug, name")
    .single()
  if (orgError) {
    await serviceClient.auth.admin.deleteUser(authUser.user.id)
    return { error: orgError.message }
  }

  const { error: userError } = await serviceClient
    .from("users")
    .insert({ org_id: org.id, email: adminEmail, role: "admin" })
  if (userError) {
    await serviceClient.auth.admin.deleteUser(authUser.user.id)
    await serviceClient.from("organizations").delete().eq("id", org.id)
    return { error: userError.message }
  }

  const { error: settingsError } = await serviceClient
    .from("org_settings")
    .insert({ org_id: org.id, settings: {} })
  if (settingsError) {
    console.error("[v0] Failed to create default settings:", settingsError)
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })
  if (signInError) return { error: signInError.message, org }

  revalidatePath(`/tenant/${slug}/dashboard`)
  redirect(`/tenant/${slug}/dashboard`)
}

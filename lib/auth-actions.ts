"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const slug = formData.get("slug") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath(`/tenant/${slug}/dashboard`)
  redirect(`/tenant/${slug}/dashboard`)
}

export async function signOut(slug: string) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath(`/tenant/${slug}/login`)
  redirect(`/tenant/${slug}/login`)
}

export async function getSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("users")
    .select("id, org_id, email, role")
    .eq("email", user.email)
    .single()

  return data
}

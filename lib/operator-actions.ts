"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function getOperators(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("operators")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true })
  return data || []
}

export async function addOperator(
  orgId: string,
  email: string,
  officeId: string,
  pin: string,
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("operators")
    .insert({ org_id: orgId, email, office_id: officeId, pin })

  if (error) return { error: error.message }

  const serviceClient = await createServiceClient()
  const { error: userError } = await serviceClient
    .from("users")
    .insert({ org_id: orgId, email, role: "operator" })

  if (userError) console.error("[v0] Failed to create operator user:", userError)

  return { success: true }
}

export async function updateOperator(
  id: string,
  updates: { email?: string; office_id?: string; pin?: string },
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("operators")
    .update(updates)
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteOperator(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("operators")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function verifyOperatorPinByOffice(officeId: string, pin: string, orgId: string) {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("operators")
    .select("id")
    .eq("office_id", officeId)
    .eq("pin", pin)
    .eq("org_id", orgId)
    .maybeSingle()
  return !!data
}

export async function verifyOperatorPin(email: string, pin: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("operators")
    .select("id, office_id")
    .eq("email", email.toLowerCase())
    .eq("pin", pin)
    .single()

  return data || null
}

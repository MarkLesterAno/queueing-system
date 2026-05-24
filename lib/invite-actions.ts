"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Resend } from "resend"

export async function sendInvitation(email: string) {
  const supabase = await createClient()

  const token = crypto.randomUUID()

  const { error } = await supabase
    .from("invitations")
    .insert({ email: email.toLowerCase(), token })

  if (error) return { error: error.message }

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { error: emailError } = await resend.emails.send({
    from: "QueueFlow <onboarding@resend.dev>",
    to: email,
    subject: "Join QueueFlow — Set up your organization",
    html: `
      <p>You've been invited to set up your organization on QueueFlow.</p>
      <p><a href="${origin}/onboarding?token=${token}&email=${encodeURIComponent(email)}">Click here to get started</a></p>
      <p>This link expires in 7 days.</p>
    `,
  })

  if (emailError) return { error: emailError.message }
  return { success: true }
}

export async function verifyInvitationToken(token: string, email: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("invitations")
    .select("id, email, status")
    .eq("token", token)
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .single()

  if (!data) return null

  await supabase
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", data.id)

  return data
}

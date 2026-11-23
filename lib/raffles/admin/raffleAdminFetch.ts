"use client"

import { supabase } from "@/src/lib/supabase"

/** Authenticated requests to Raffles admin routes only. Never use for external URLs. */
export async function raffleAdminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session?.access_token) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${session.access_token}`)

  return fetch(input, { ...init, headers })
}

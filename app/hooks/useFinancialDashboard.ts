"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useFinancialDashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      /* =========================
         🔐 SESIÓN REAL
      ========================= */
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) {
        console.error("❌ Session error:", sessionError)
        setData(null)
        return
      }

      const session = sessionData?.session

      if (!session?.access_token) {
        console.warn("⚠️ No session/token")
        setData(null)
        return
      }

      /* 🔍 DEBUG (BORRAR DESPUÉS) */
      console.log("👤 USER:", session.user?.email)

      /* =========================
         📡 FETCH SEGURO
      ========================= */
      const res = await fetch("/api/user/finance", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!res.ok) {
        console.error("❌ API ERROR:", res.status)
        setData(null)
        return
      }

      const json = await res.json()

      /* =========================
         🛡️ VALIDACIÓN DEFENSIVA
      ========================= */
      if (!json || typeof json !== "object") {
        console.warn("⚠️ Invalid response")
        setData(null)
        return
      }

      setData(json)

    } catch (error) {
      console.error("Financial dashboard error:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading }
}
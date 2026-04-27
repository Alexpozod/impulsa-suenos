"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useAdminFinancialDashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setData(null)
        return
      }

      const res = await fetch("/api/admin/finance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        console.error("❌ ADMIN API ERROR:", res.status)
        setData(null)
        return
      }

      const json = await res.json()
      setData(json)

    } catch (error) {
      console.error("Admin finance error:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading }
}
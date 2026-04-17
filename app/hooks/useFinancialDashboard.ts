"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export function useFinancialDashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch("/api/user/finance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const json = await res.json()
      setData(json)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading }
}
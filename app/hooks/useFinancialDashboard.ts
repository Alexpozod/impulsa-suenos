"use client"

import { useEffect, useState } from "react"

export function useFinancialDashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      /* =========================
         📡 ADMIN ENDPOINT REAL
      ========================= */
      const res = await fetch("/api/admin/finance", {
        cache: "no-store"
      })

      if (!res.ok) {
        console.error("❌ API ERROR:", res.status)
        setData(null)
        return
      }

      const json = await res.json()

      console.log("📊 ADMIN FINANCE:", json)

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
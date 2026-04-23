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

      const token = localStorage.getItem("token")

      /* 🔥 FIX CRÍTICO:
         CAMBIAMOS ADMIN → USER
      */
      const res = await fetch("/api/user/finance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const json = await res.json()

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
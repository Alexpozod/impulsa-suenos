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

      const res = await fetch("/api/admin/finance")

      if (!res.ok) {
        throw new Error("Error al obtener datos financieros")
      }

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
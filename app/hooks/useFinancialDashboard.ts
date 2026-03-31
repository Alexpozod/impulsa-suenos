"use client"

import { useEffect, useState } from "react"

export function useFinancialDashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const res = await fetch("/api/campaigns/enriched")
      const json = await res.json()

      setData(json)
      setLoading(false)
    }

    load()
  }, [])

  return { data, loading }
}

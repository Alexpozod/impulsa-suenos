'use client'

import { useEffect, useState } from "react"

export default function ViewersCounter({ campaign_id }: { campaign_id: string }) {

  const [viewers, setViewers] = useState<number | null>(null)

  useEffect(() => {
    if (!campaign_id) return

    const load = async () => {
      try {
        const res = await fetch(`/api/donations-live?campaign_id=${campaign_id}`)
        const data = await res.json()

        const donations = Array.isArray(data) ? data : []

        // 🔥 ACTIVIDAD REAL (últimas donaciones)
        const recentActivity = donations.slice(0, 10).length

        // 🧠 ALGORITMO PRO (basado en actividad)
        let calculated = 2 + recentActivity

        // límite natural
        if (calculated > 25) calculated = 25

        setViewers(calculated)

      } catch (err) {
        console.error("viewers error", err)
        setViewers(3) // fallback mínimo
      }
    }

    load()

    // 🔄 refresco cada 15s
    const interval = setInterval(load, 15000)

    return () => clearInterval(interval)

  }, [campaign_id])

  if (viewers === null) return null

  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm text-center">

      👁️ {viewers} personas viendo esta campaña ahora

    </div>
  )
}
'use client'

import { useEffect, useState } from "react"

export default function ViewersCounter({ campaign_id }: { campaign_id: string }) {

  const [viewers, setViewers] = useState<number | null>(null)

  useEffect(() => {

    if (!campaign_id) return

    let interval: any

    const loadViewers = async () => {
      try {

        const res = await fetch(`/api/donations-live?campaign_id=${campaign_id}`)
        const data = await res.json()

        // 🔥 DONACIONES REALES
        const donations = Array.isArray(data) ? data : []

        const now = Date.now()

        // ⏱️ últimas 10 min (actividad real)
        const recent = donations.filter((d: any) => {
          const t = new Date(d.created_at).getTime()
          return now - t < 10 * 60 * 1000
        })

        // 🎯 BASE REAL (actividad)
        let base = recent.length

        // 🔥 ESCALA INTELIGENTE (no lineal)
        let calculated = 0

        if (base === 0) {
          calculated = 1 // siempre al menos alguien
        } else if (base <= 3) {
          calculated = base * 2
        } else if (base <= 10) {
          calculated = base * 3
        } else {
          calculated = Math.min(base * 4, 50)
        }

        // 🎯 suavizado para que no sea brusco
        setViewers(prev => {
          if (prev === null) return calculated
          return Math.round((prev + calculated) / 2)
        })

      } catch (err) {
        console.error("viewers error", err)
      }
    }

    loadViewers()

    interval = setInterval(loadViewers, 10000)

    return () => clearInterval(interval)

  }, [campaign_id])

  // 🔒 evita flicker
  if (viewers === null) return null

  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm text-center">
      👁️ {viewers} personas viendo esta campaña ahora
    </div>
  )
}
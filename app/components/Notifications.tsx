'use client'

import { useEffect, useState } from "react"

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`

  return `hace ${Math.floor(seconds / 86400)} días`
}

export default function Notifications() {

  const [donations, setDonations] = useState<any[]>([])
  const [visible, setVisible] = useState<any>(null)

  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("/api/donations-live")
        const data = await res.json()
        setDonations(data || [])
      } catch (err) {
        console.error("Notifications error:", err)
      }
    }

    load()

    const refresh = setInterval(load, 20000)
    return () => clearInterval(refresh)

  }, [])

  useEffect(() => {
    if (!donations.length) return

    let index = 0

    const interval = setInterval(() => {
      setVisible(donations[index])
      index = (index + 1) % donations.length
    }, 5000)

    return () => clearInterval(interval)
  }, [donations])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50">

      <div className="bg-black text-white px-4 py-3 rounded-xl shadow-lg text-sm">

        🔥 Alguien donó <b>${Number(visible.amount).toLocaleString()}</b><br />

        <span className="text-xs opacity-70">
          {timeAgo(visible.created_at)}
        </span>

      </div>

    </div>
  )
}
"use client"

import { useEffect, useState } from "react"

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`

  return `hace ${Math.floor(seconds / 86400)} días`
}

export default function LiveFeed() {

  const [donations, setDonations] = useState<any[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("/api/donations-live")
        const data = await res.json()
        setDonations(data || [])
      } catch (err) {
        console.error("LiveFeed error:", err)
      }
    }

    load()

    const refresh = setInterval(load, 15000)
    return () => clearInterval(refresh)

  }, [])

  useEffect(() => {
    if (!donations.length) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % donations.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [donations])

  if (!donations.length) return null

  const current = donations[index]

  return (
    <div className="bg-slate-900 text-white text-sm rounded-xl px-4 py-3 text-center shadow">
      🔴 En vivo: alguien donó ${Number(current.amount).toLocaleString()} {timeAgo(current.created_at)}
    </div>
  )
}
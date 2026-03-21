"use client"

import { useEffect, useState } from "react"

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`

  return `hace ${Math.floor(seconds / 86400)} días`
}

export default function LiveFeed({ donations }: { donations: any[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!donations || donations.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % donations.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [donations])

  if (!donations || donations.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-500 text-center">
        Aún no hay actividad
      </div>
    )
  }

  const current = donations[index]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 text-center transition-all duration-500">
      🔴 En vivo: alguien compró ${Number(current.amount).toLocaleString()} {timeAgo(current.created_at)}
    </div>
  )
}

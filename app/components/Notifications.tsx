'use client'

import { useEffect, useState } from "react"

type Donation = {
  id: string
  amount: number
  created_at: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`

  return `hace ${Math.floor(seconds / 86400)} días`
}

export default function Notifications({ donations }: { donations: Donation[] }) {

  const [visible, setVisible] = useState<Donation | null>(null)

  useEffect(() => {
    if (!donations || donations.length === 0) return

    let index = 0

    const interval = setInterval(() => {
      setVisible(donations[index])
      index = (index + 1) % donations.length
    }, 4000)

    return () => clearInterval(interval)
  }, [donations])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in">

      <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl px-4 py-3 text-sm text-white flex items-center gap-2">

        <span className="text-green-400">●</span>

        <span>
          Alguien compró <b>${visible.amount}</b> en tickets
        </span>

        <span className="text-slate-400 text-xs">
          {timeAgo(visible.created_at)}
        </span>

      </div>

    </div>
  )
}

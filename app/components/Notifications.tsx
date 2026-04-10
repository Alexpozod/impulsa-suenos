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
  const [show, setShow] = useState(false)

  // 🔄 cargar donaciones
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

    const refresh = setInterval(load, 15000) // 🔥 más dinámico
    return () => clearInterval(refresh)

  }, [])

  // 🔁 rotación + animación
  useEffect(() => {
    if (!donations.length) return

    let index = 0

    const interval = setInterval(() => {

      const donation = donations[index]
      index = (index + 1) % donations.length

      setVisible(donation)
      setShow(true)

      // ocultar suavemente
      setTimeout(() => {
        setShow(false)
      }, 4000)

    }, 7000) // 🔥 mejor timing

    return () => clearInterval(interval)
  }, [donations])

  if (!visible || !show) return null

  // 🔐 anonimizar nombre (MEJORA CLAVE)
  const name = visible.user_email
    ? visible.user_email.split("@")[0].slice(0, 4) + "****"
    : "Alguien"

  return (
    <div className="fixed bottom-6 left-6 z-50 transition-all duration-300">

      <div className="bg-white border shadow-xl rounded-xl px-4 py-3 text-sm animate-fade-in">

        <p>
          💖 <b>{name}</b> donó{" "}
          <b>${Number(visible.amount).toLocaleString()}</b>
        </p>

        <p className="text-xs text-gray-500">
          {timeAgo(visible.created_at)}
        </p>

      </div>

    </div>
  )
}
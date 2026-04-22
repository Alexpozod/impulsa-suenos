"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
        setDonations(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("LiveFeed error:", err)
      }
    }

    load()
    const refresh = setInterval(load, 8000)
    return () => clearInterval(refresh)
  }, [])

  useEffect(() => {
    if (!donations.length) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % donations.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [donations])

  if (!donations.length) return null

  const current = donations[index]

  const name = current.user_email
    ? current.user_email.split("@")[0].slice(0, 4) + "****"
    : "Alguien"

  return (
    <div className="fixed bottom-6 left-6 z-50">

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}

          className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl px-4 py-3"
        >

          {/* DOT LIVE */}
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />

          {/* TEXT */}
          <div className="text-sm">

            <p className="text-gray-900 font-medium leading-tight">
              {name} donó{" "}
              <span className="font-bold text-green-600">
                ${Number(current.amount).toLocaleString()}
              </span>
            </p>

            <p className="text-xs text-gray-500">
              {timeAgo(current.created_at)}
            </p>

          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  )
}
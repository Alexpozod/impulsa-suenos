'use client'

import { useEffect, useState } from "react"

export default function Countdown({ endDate }: { endDate: string }) {

  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {

      const now = new Date().getTime()
      const end = new Date(endDate).getTime()

      const distance = end - now

      if (distance <= 0) {
        setTimeLeft("FINALIZADO")
        clearInterval(interval)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((distance / (1000 * 60)) % 60)
      const seconds = Math.floor((distance / 1000) % 60)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)

    }, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  return (
    <div className="bg-red-600 text-white p-4 rounded-xl text-center mb-6 font-bold">
      ⏳ Tiempo restante: {timeLeft}
    </div>
  )
}

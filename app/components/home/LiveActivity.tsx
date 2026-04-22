'use client'

import { useEffect, useState } from "react"

const names = ["Carlos", "María", "Juan", "Ana", "Luis", "Sofía"]
const amounts = [2000, 5000, 10000, 2500, 8000]

export default function LiveActivity() {

  const [activity, setActivity] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]

      setActivity(`${name} donó $${amount.toLocaleString()}`)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  if (!activity) return null

  return (
    <div className="fixed bottom-6 left-6 bg-white shadow-xl border px-4 py-2 rounded-xl text-sm z-50 animate-fade-in">
      🔥 {activity}
    </div>
  )
}
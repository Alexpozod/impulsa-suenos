'use client'

import { useEffect, useState } from "react"

export default function ViewersCounter() {

  const [viewers, setViewers] = useState(0)

  useEffect(() => {

    // 🎯 valor inicial realista
    const base = Math.floor(Math.random() * 6) + 3 // entre 3 y 8
    setViewers(base)

    // 🔄 variación natural
    const interval = setInterval(() => {

      setViewers((prev) => {

        const change = Math.floor(Math.random() * 3) - 1 // -1, 0, +1
        let next = prev + change

        if (next < 2) next = 2
        if (next > 15) next = 15

        return next
      })

    }, 4000)

    return () => clearInterval(interval)

  }, [])

  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm text-center">

      👁️ {viewers} personas viendo esta campaña ahora

    </div>
  )
}
"use client"

import { useState } from "react"

export default function LiveDraw({ tickets }: { tickets: any[] }) {
  const [rolling, setRolling] = useState(false)
  const [winner, setWinner] = useState<any>(null)
  const [current, setCurrent] = useState("----")

  const startDraw = () => {
    if (!tickets || tickets.length === 0) return

    setRolling(true)
    setWinner(null)

    let i = 0

    const interval = setInterval(() => {
      const random =
        tickets[Math.floor(Math.random() * tickets.length)]

      setCurrent(random.ticket_number)

      i++

      if (i > 20) {
        clearInterval(interval)

        const final =
          tickets[Math.floor(Math.random() * tickets.length)]

        setCurrent(final.ticket_number)
        setWinner(final)
        setRolling(false)
      }
    }, 100)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">

      <p className="text-sm text-slate-400 mb-2">
        Sorteo en vivo
      </p>

      <div className="text-4xl font-bold text-yellow-400 mb-4">
        #{current}
      </div>

      <button
        onClick={startDraw}
        disabled={rolling}
        className="bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-500"
      >
        {rolling ? "Sorteando..." : "🎰 Iniciar sorteo"}
      </button>

      {winner && (
        <div className="mt-6 text-green-400 font-bold text-lg">
          🏆 Ganador: #{winner.ticket_number}
        </div>
      )}

    </div>
  )
}

"use client"

import { useState } from "react"

export default function DrawButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const draw = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/draw-winner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          secret: process.env.NEXT_PUBLIC_ADMIN_SECRET,
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="mb-10">
      <button
        onClick={draw}
        className="bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 w-full"
      >
        {loading ? "Sorteando..." : "🎯 REALIZAR SORTEO EN VIVO"}
      </button>

      {result?.winner && (
        <div className="mt-4 bg-green-900/40 border border-green-500 p-4 rounded-lg text-center">
          <p className="text-sm">Ganador:</p>
          <p className="text-xl font-bold text-green-400">
            Ticket #{result.winner.ticket_number}
          </p>
        </div>
      )}
    </div>
  )
}

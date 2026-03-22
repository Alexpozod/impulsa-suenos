"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch("/api/admin/campaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
  }, [])

  const drawWinner = async (campaign_id: string) => {
    setLoadingId(campaign_id)
    setResult(null)

    try {
      const res = await fetch("/api/draw-winner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaign_id }),
      })

      const data = await res.json()

      setResult({
        campaign_id,
        data,
      })
    } catch (error) {
      console.error(error)
    }

    setLoadingId(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        Panel de Sorteos (ADMIN)
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {campaigns.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/40 transition"
          >

            <h2 className="text-xl font-bold mb-2">
              {c.title}
            </h2>

            <p className="text-sm text-slate-400 mb-1">
              🎟️ Tickets: {c.tickets_sold}
            </p>

            <p className="text-sm text-slate-400 mb-4">
              💰 Total: ${c.total_raised}
            </p>

            {/* BOTONES */}
            <div className="flex gap-3">

              {/* SORTEO */}
              <button
                onClick={() => drawWinner(c.id)}
                disabled={loadingId === c.id}
                className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold transition"
              >
                {loadingId === c.id
                  ? "Sorteando..."
                  : "🎯 Sortear"}
              </button>

              {/* VER DETALLE */}
              <Link href={`/admin/campaign/${c.id}`} className="w-full">
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold transition">
                  Ver detalle
                </button>
              </Link>

            </div>

            {/* RESULTADO */}
            {result?.campaign_id === c.id && result?.data?.winner && (
              <div className="mt-4 bg-green-900/40 border border-green-500 p-4 rounded-lg text-center">
                <p className="text-sm">Ganador:</p>
                <p className="text-xl font-bold text-green-400">
                  Ticket #{result.data.winner.ticket_number}
                </p>
              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  )
}

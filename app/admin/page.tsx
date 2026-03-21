"use client"

import { useEffect, useState } from "react"

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
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >

            <h2 className="text-xl font-bold mb-2">
              {c.title}
            </h2>

            <p className="text-sm text-slate-400 mb-2">
              Tickets vendidos: {c.tickets_sold}
            </p>

            <p className="text-sm text-slate-400 mb-4">
              Total recaudado: ${c.total_raised}
            </p>

            <button
              onClick={() => drawWinner(c.id)}
              disabled={loadingId === c.id}
              className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold transition"
            >
              {loadingId === c.id
                ? "Sorteando..."
                : "🎯 REALIZAR SORTEO"}
            </button>

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

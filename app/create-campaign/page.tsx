"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function CreateCampaignPage() {

  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")

  const [mode, setMode] = useState<"goal" | "tickets">("goal")

  // 🎟️ sorteo puro
  const [ticketPrice, setTicketPrice] = useState("")

  // 🎁 incentivo
  const [hasRaffle, setHasRaffle] = useState(false)
  const [raffleMin, setRaffleMin] = useState("")
  const [raffleUnit, setRaffleUnit] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {

    setError("")

    if (!title || !description || !goal) {
      setError("Completa los campos obligatorios")
      return
    }

    if (mode === "tickets" && !ticketPrice) {
      setError("Define precio por ticket")
      return
    }

    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/campaign/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        title,
        description,
        goal_amount: Number(goal),
        total_tickets: 1000,
        mode,
        ticket_price: Number(ticketPrice || 0),
        has_raffle: hasRaffle,
        raffle_min_amount: Number(raffleMin || 0),
        raffle_unit_amount: Number(raffleUnit || 0)
      })
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          🚀 Crear campaña
        </h1>

        {/* INFO */}
        <input
          placeholder="Título"
          className="w-full border p-3 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Descripción"
          className="w-full border p-3 rounded mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Meta ($)"
          type="number"
          className="w-full border p-3 rounded mb-5"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        {/* MODO */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Tipo de campaña</p>

          <select
            className="w-full border p-3 rounded"
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
          >
            <option value="goal">Donaciones</option>
            <option value="tickets">Sorteo</option>
          </select>
        </div>

        {/* 🎟️ SORTEO PURO */}
        {mode === "tickets" && (
          <div className="mb-6 bg-purple-50 p-4 rounded">

            <p className="font-semibold mb-2">🎟️ Configuración sorteo</p>

            <input
              placeholder="Precio por ticket ($)"
              type="number"
              className="w-full border p-3 rounded"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
            />
          </div>
        )}

        {/* 🎁 INCENTIVO */}
        {mode === "goal" && (
          <div className="mb-6 bg-green-50 p-4 rounded">

            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={hasRaffle}
                onChange={(e) => setHasRaffle(e.target.checked)}
              />
              Activar sorteo como incentivo
            </label>

            {hasRaffle && (
              <div className="space-y-3">

                <input
                  placeholder="Monto mínimo para participar ($)"
                  type="number"
                  className="w-full border p-3 rounded"
                  value={raffleMin}
                  onChange={(e) => setRaffleMin(e.target.value)}
                />

                <input
                  placeholder="Cada cuánto genera tickets ($)"
                  type="number"
                  className="w-full border p-3 rounded"
                  value={raffleUnit}
                  onChange={(e) => setRaffleUnit(e.target.value)}
                />

                <p className="text-sm text-gray-500">
                  Ejemplo: mínimo 1000 / cada 5000 → más donas, más participas
                </p>

              </div>
            )}

          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}

        {/* BOTÓN */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Creando..." : "Crear campaña"}
        </button>

      </div>

    </main>
  )
}
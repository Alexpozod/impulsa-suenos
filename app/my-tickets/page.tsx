'use client'

import { useState } from "react"

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!email) {
      alert("Ingresa tu email")
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch("/api/my-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      setTickets(data.tickets || [])

    } catch (error) {
      alert("Error al buscar tickets")
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          🎟️ Tus tickets
        </h1>

        {/* buscador */}
        <div className="flex gap-2 mb-6">
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
          />

          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded font-semibold"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </div>

        {/* estados */}
        {loading && <p className="text-gray-400">Buscando tickets...</p>}

        {!loading && searched && tickets.length === 0 && (
          <p className="text-gray-400">No tienes tickets aún</p>
        )}

        {/* lista */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticket_number + ticket.created_at}
              className="bg-[#111827] p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-400">🎟️ Ticket</p>

              <p className="text-2xl font-bold mb-2">
                #{ticket.ticket_number}
              </p>

              <p className="text-xs text-gray-400">📌 Campaña:</p>

              <p className="text-sm font-semibold mb-2">
                {ticket.campaigns?.title || "Campaña"}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

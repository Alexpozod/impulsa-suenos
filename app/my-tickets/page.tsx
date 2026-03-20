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

      if (data.tickets) {
        setTickets(data.tickets)
      } else {
        setTickets([])
      }

    } catch (error) {
      alert("Error al buscar tickets")
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎟️ Mis Tickets</h1>

      {/* BUSCADOR */}
      <div className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="Ingresa tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded text-black w-full"
        />

        <button
          onClick={handleSearch}
          className="bg-green-500 px-4 rounded font-bold"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* ESTADOS */}
      {loading && <p className="text-gray-400">Cargando tickets...</p>}

      {!loading && searched && tickets.length === 0 && (
        <p className="text-gray-400">No tienes tickets aún</p>
      )}

      {/* LISTA */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.ticket_number + ticket.created_at}
            className="bg-gray-800 p-4 rounded-xl text-center shadow-lg"
          >
            <p className="text-sm text-gray-400">🎟️ Ticket</p>
            <p className="text-2xl font-bold mb-2">
              #{ticket.ticket_number}
            </p>

            <p className="text-xs text-gray-400">
              📌 Campaña:
            </p>
            <p className="text-sm break-all mb-2">
              {ticket.campaign_id}
            </p>

            <p className="text-xs text-gray-500">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

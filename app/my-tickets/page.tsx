'use client'

import { useEffect, useState } from "react"

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [email, setEmail] = useState("")

  const handleSearch = async () => {
    if (!email) return alert("Ingresa tu email")

    const res = await fetch(`/api/my-tickets?email=${email}`)
    const data = await res.json()

    setTickets(data.tickets || [])
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🎟️ Mis Tickets</h1>

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
          Buscar
        </button>
      </div>

      {tickets.length === 0 && (
        <p className="text-gray-400">No tienes tickets aún</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-800 p-4 rounded-xl text-center"
          >
            <p className="text-sm text-gray-400">Ticket</p>
            <p className="text-xl font-bold">
              #{ticket.ticket_number}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

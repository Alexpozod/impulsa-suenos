'use client'

import { useEffect, useState } from "react"

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    const email = prompt("Ingresa tu email para ver tus tickets")

    if (!email) return

    fetch(`/api/my-tickets?email=${email}`)
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🎟️ Tus Tickets</h2>

      {tickets.length === 0 && <p>No tienes tickets aún</p>}

      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="p-3 bg-gray-800 rounded">
            Ticket #{t.ticket_number}
          </li>
        ))}
      </ul>
    </div>
  )
}

'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function MyTicketsPage() {

  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {

    try {

      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Debes iniciar sesión")
        return
      }

      const res = await fetch("/api/my-tickets", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      const data = await res.json()

      setTickets(data.tickets || [])

    } catch (err) {
      console.error(err)
      alert("Error cargando tickets")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          🎟️ Mis tickets
        </h1>

        {loading && <p className="text-gray-400">Cargando...</p>}

        {!loading && tickets.length === 0 && (
          <p className="text-gray-400">No tienes tickets aún</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-[#111827] p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-400">🎟️ Ticket</p>

              <p className="text-lg font-bold mb-2">
                {ticket.ticket_number}
              </p>

              <p className="text-xs text-gray-400">📌 Campaña</p>

              <p className="text-sm font-semibold">
                {ticket.campaigns?.title || "Campaña"}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
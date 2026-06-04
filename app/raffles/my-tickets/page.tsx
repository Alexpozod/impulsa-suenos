"use client"

import { useState } from "react"

export default function MyTicketsPage() {

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [tickets, setTickets] =
    useState<any[]>([])

  async function searchTickets() {

    if (!email.trim()) {

      alert(
        "Ingresa tu correo"
      )

      return
    }

    try {

      setLoading(true)

      const res =
        await fetch(
          `/api/raffles/my-tickets?email=${encodeURIComponent(email)}`
        )

      const data =
        await res.json()

      setTickets(
        data || []
      )

    } catch (error) {

      console.error(error)

      alert(
        "Error cargando tickets"
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
          px-4
          py-12
        "
      >

        <h1
          className="
            text-4xl
            font-black
            mb-8
          "
        >
          Mis Tickets
        </h1>

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-3xl
            p-6
            space-y-4
          "
        >

          <input
            type="email"
            placeholder="Correo utilizado en la compra"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
              w-full
              bg-slate-950
              border
              border-slate-700
              rounded-2xl
              px-4
              py-4
            "
          />

          <button
            onClick={searchTickets}
            disabled={loading}
            className="
              w-full
              py-4
              rounded-2xl
              bg-blue-600
              font-bold
            "
          >

            {
              loading
                ? "Buscando..."
                : "Buscar mis tickets"
            }

          </button>

        </div>

        <div
          className="
            mt-8
            space-y-6
          "
        >

          {tickets.map(ticket => (

            <div
              key={ticket.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                p-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <img
                  src={
                    ticket.raffle?.cover_image
                  }
                  alt=""
                  className="
                    w-20
                    h-20
                    rounded-xl
                    object-cover
                  "
                />

                <div>

                  <h2
                    className="
                      font-bold
                      text-lg
                    "
                  >
                    {
                      ticket.raffle?.title
                    }
                  </h2>

                  <p
                    className="
                      text-slate-400
                    "
                  >
                    {
                      ticket.ticket_code
                    }
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}
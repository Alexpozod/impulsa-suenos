"use client"

import {
  useState,
  useEffect
} from "react"

export default function MyTicketsPage() {

  const [email, setEmail] =
    useState("")

    useEffect(() => {

  const savedEmail =
    localStorage.getItem(
      "raffle_buyer_email"
    )

  if (savedEmail) {

    setEmail(savedEmail)
    
  }

}, [])

  const [loading, setLoading] =
    useState(false)

  const [tickets, setTickets] =
    useState<any[]>([])

    const groupedTickets =
  Object.values(

    tickets.reduce(
      (acc: any, ticket: any) => {

        const raffleId =
          ticket.raffle_id

        if (!acc[raffleId]) {

          acc[raffleId] = {

            raffle:
              ticket.raffle,

            tickets: []
          }
        }

        acc[raffleId]
          .tickets
          .push(ticket)

        return acc

      },
      {}
    )

  )

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

        <div className="mb-8">

  <h1
    className="
      text-4xl
      font-black
      mb-3
    "
  >
    🎟️ Mis Participaciones
  </h1>

  <p
    className="
      text-slate-400
      max-w-2xl
      leading-relaxed
    "
  >
    🎟️ Mis participaciones

Consulta todas tus participaciones utilizando el mismo correo electrónico con el que realizaste tu compra. Si participaste en distintos sorteos, aparecerán agrupados automáticamente.
  </p>

</div>

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
              bg-cyan-500
              font-bold
            "
          >

            {
              loading
                ? "Buscando..."
                : "Buscar mis participaciones"
            }

          </button>

        </div>

        <div
          className="
            mt-8
            space-y-6
          "
        >

{groupedTickets.map(
  (group: any) => (

    <div
      key={
        group.raffle?.id
      }
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
          mb-6
        "
      >

        <img
          src={
            group.raffle?.cover_image
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
              text-xl
            "
          >
            {
              group.raffle?.title
            }
          </h2>

          <p
  className="
    text-slate-400
    mt-1
  "
>
  🎟️ {group.tickets.length}{" "}
  {group.tickets.length === 1
    ? "ticket registrado"
    : "tickets registrados"}
</p>

        </div>

      </div>

      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >

        {group.tickets.map(
  (ticket: any) => {

        const isWinner =
      ticket.status === "winner"

    const isComplimentary =
      ticket.status ===
      "complimentary"

    return (

      <div
        key={ticket.id}
        className={`
          px-3
          py-2
          rounded-xl
          border
          text-sm

                    ${
            isWinner
              ? "bg-yellow-500/20 border-yellow-500 text-yellow-300 font-bold"
              : isComplimentary
                ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-200"
                : "bg-slate-950 border-slate-700"
          }
        `}
      >

                {isWinner && (
          <div
            className="
              text-xs
              mb-1
            "
          >
            🏆 GANADOR
          </div>
        )}

        {isComplimentary && (
          <div
            className="
              text-xs
              mb-1
              font-bold
              text-cyan-300
            "
          >
            🎁 PROMOCIONAL
          </div>
        )}

        {ticket.ticket_code}

      </div>

    )

  }
)}

      </div>

    </div>

  )
)}

               </div>

        {!loading && tickets.length === 0 && (

          <div
            className="
              mt-8
              bg-slate-900
              border
              border-slate-800
              rounded-3xl
              p-10
              text-center
            "
          >

            <div className="text-6xl mb-4">
              🎟️
            </div>

            <h2
              className="
                text-2xl
                font-black
                mb-3
              "
            >
              No encontramos participaciones
            </h2>

            <p
              className="
                text-slate-400
                max-w-xl
                mx-auto
                leading-relaxed
              "
            >
              Ingresa el mismo correo electrónico que utilizaste
              al realizar la compra. Si acabas de pagar, espera unos
              instantes mientras procesamos tu participación.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}
"use client"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useParams
} from "next/navigation"

type RaffleData = {
  id: string
  slug: string
  title: string
  description: string
  short_description?: string

  prize_title: string
  prize_description?: string

  cover_image: string

  gallery?: string[]

  ticket_price_clp: number

  currency: string

  generated_ticket_count: number

  sold_ticket_count: number
  reserved_ticket_count: number

  sold_tickets: number
  reserved_tickets: number
  available_tickets: number

  total_tickets: number

  progress: number

  revenue: number

  end_date?: string

  status: string
}

type Winner = {
  id: string
  ticket_code: string
  prize_title: string
  prize_position: number
  winner_name: string
  delivery_status: string
  evidence_images: string[]
}

type ApiResponse = {
  ok: boolean
  raffle: RaffleData
  winners?: Winner[]
}

export default function RafflePage() {

  const params = useParams()

  const [data, setData] =
    useState<ApiResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)

  const [quantity, setQuantity] =
    useState(1)

  const [buyerName, setBuyerName] =
    useState("")

  const [buyerEmail, setBuyerEmail] =
    useState("")

  useEffect(() => {

  loadRaffle()

}, [])

  async function loadRaffle() {

    try {

      const res =
        await fetch(
          `/api/raffles/${params.slug}`
        )

      const json =
        await res.json()

      setData(json)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  async function buyTickets() {

    if (!data?.raffle?.id) {
      return
    }

    if (!buyerName.trim()) {

      alert("Ingresa tu nombre")

      return
    }

    if (!buyerEmail.trim()) {

      alert("Ingresa tu correo")

      return
    }

    try {

      setProcessing(true)

      const res =
        await fetch(
          "/api/raffles/create-payment",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              raffle_id:
                data.raffle.id,

              quantity,

              buyer_name:
                buyerName,

              buyer_email:
                buyerEmail,

              source:
                "web"

            })
          }
        )

      const json =
        await res.json()

      if (!res.ok) {

  console.error(json)

  if (
    json?.error ===
    "pending_order_exists"
  ) {

    alert(
      "Ya tienes una compra pendiente asociada a este correo. Espera unos minutos o utiliza otro correo."
    )

    return
  }

  if (
    json?.error ===
    "invalid_email"
  ) {

    alert(
      "No se permiten correos temporales."
    )

    return
  }

  if (
    json?.error ===
    "raffle_inactive"
  ) {

    alert(
      "Este sorteo ya no se encuentra disponible."
    )

    return
  }

  alert(
    "No fue posible iniciar el pago."
  )

  return
}

      if (json?.url) {

  localStorage.setItem(
    "last_raffle_order_id",
    json.order_id
  )

  window.location.href =
    `${json.url}?token=${json.token}`

}

    } catch (error) {

      console.error(error)

      alert(
        "Error procesando pago"
      )

    } finally {

      setProcessing(false)
    }
  }

    const raffle =
  data?.raffle

  const winners =
  data?.winners || []
  
  const totalPrice =
    useMemo(() => {

      return (
        Number(
          raffle?.ticket_price_clp || 0
        ) * quantity
      )

    }, [
      raffle,
      quantity
    ])

  const countdown =
    useMemo(() => {

      if (!raffle?.end_date) {
        return null
      }

      const end =
        new Date(
          raffle.end_date
        ).getTime()

      const now =
        Date.now()

      const diff =
        end - now

      if (diff <= 0) {

        return "Finalizado"
      }

      const days =
        Math.floor(
          diff / (
            1000 * 60 * 60 * 24
          )
        )

      const hours =
        Math.floor(
          (
            diff % (
              1000 * 60 * 60 * 24
            )
          ) / (
            1000 * 60 * 60
          )
        )

      return `${days}d ${hours}h`

    }, [raffle])

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          flex
          items-center
          justify-center
        "
      >
        Cargando sorteo...
      </div>
    )
  }

  if (!raffle) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          flex
          items-center
          justify-center
        "
      >
        Sorteo no encontrado
      </div>
    )
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
          max-w-7xl
          mx-auto
          px-4
          py-10
        "
      >

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-10
          "
        >

          <div>

           <img
            src={
                raffle.cover_image ||
                "/placeholder.jpg"
            }
              alt={raffle.title}
              className="
                w-full
                rounded-3xl
                border
                border-slate-800
              "
            />

          </div>

          <div
            className="
              space-y-6
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  px-4
                  py-2
                  rounded-full
                  bg-blue-500/20
                  text-blue-300
                  text-sm
                  border
                  border-blue-500/30
                  mb-4
                "
              >
                Sorteo activo
              </div>

              <h1
                className="
                  text-4xl
                  lg:text-5xl
                  font-black
                  leading-tight
                "
              >
                {raffle.title}
              </h1>

              <p
                className="
                  mt-5
                  text-slate-300
                  text-lg
                  leading-relaxed
                "
              >
                {raffle.description}
              </p>

            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-4
              "
            >

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-3xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Tickets vendidos
                </p>

                <h3
                  className="
                    text-3xl
                    font-black
                    mt-2
                  "
                >
                  {raffle.sold_tickets}
                </h3>

              </div>

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-3xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Disponibles
                </p>

                <h3
                  className="
                    text-3xl
                    font-black
                    mt-2
                  "
                >
                  {raffle.available_tickets}
                </h3>

              </div>

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-3xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  
                </p>

                <h3
                  className="
                    text-2xl
                    font-black
                    mt-2
                  "
                >
                  $
                  {Number(
                    raffle.revenue || 0
                  ).toLocaleString("es-CL")}
                </h3>

              </div>

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-3xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  
                </p>

                <h3
                  className="
                    text-2xl
                    font-black
                    mt-2
                  "
                >
                  {countdown || "--"}
                </h3>

              </div>

            </div>

            <div
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
                  justify-between
                  mb-3
                "
              >

                <span
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Progreso
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                  "
                >
                  {raffle.progress}%
                </span>

              </div>

              <div
                className="
                  w-full
                  h-4
                  bg-slate-800
                  rounded-full
                  overflow-hidden
                "
              >

                <div
                  className="
                    h-full
                    bg-blue-500
                    rounded-full
                  "
                  style={{
                    width:
                      `${raffle.progress}%`
                  }}
                />

              </div>

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

              <div>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Valor ticket
                </p>

                <h2
                  className="
                    text-4xl
                    font-black
                    mt-2
                  "
                >
                  $
                  {Number(
                    raffle.ticket_price_clp
                  ).toLocaleString("es-CL")}
                </h2>

              </div>

              <input
                type="text"
                placeholder="Tu nombre"
                value={buyerName}
                onChange={(e) =>
                  setBuyerName(
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
                  outline-none
                "
              />

              <input
                type="email"
                placeholder="Correo electrónico"
                value={buyerEmail}
                onChange={(e) =>
                  setBuyerEmail(
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
                  outline-none
                "
              />

              <div className="grid grid-cols-4 gap-3">

  {[1, 3, 5, 10].map((value) => {

    const active =
      quantity === value

    return (

      <button
        key={value}
        type="button"
        onClick={() =>
          setQuantity(value)
        }
        className={`
          py-4
          rounded-2xl
          font-bold
          border
          transition

          ${
            active
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-950 border-slate-700 text-slate-300"
          }
        `}
      >

        {value} ticket{value > 1 ? "s" : ""}

      </button>
    )
  })}

</div>
      
              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-lg
                  font-bold
                "
              >

                <span>
                  Total
                </span>

                <span>

                  $
                  {Number(
                    totalPrice
                  ).toLocaleString("es-CL")}

                </span>

              </div>

              <button
                onClick={buyTickets}
                disabled={processing}
                className="
                  w-full
                  py-5
                  rounded-2xl
                  bg-blue-600
                  hover:bg-blue-500
                  transition
                  font-black
                  text-lg
                "
              >

                {processing
                  ? "Procesando..."
                  : "Comprar tickets"}

              </button>

            </div>

{winners.length > 0 && (

  <div
    className="
      mt-10
      bg-slate-900
      border
      border-slate-800
      rounded-3xl
      p-6
    "
  >

    <h2
      className="
        text-2xl
        font-black
        mb-6
      "
    >
      Ganadores
    </h2>

    <div className="space-y-6">

      {winners.map(winner => (

        <div
          key={winner.id}
          className="
            border
            border-slate-800
            rounded-2xl
            p-4
          "
        >

          <div>

            <strong>
              {winner.prize_title}
            </strong>

          </div>

          <div>

            Ticket:
            {" "}
            {winner.ticket_code}

          </div>

          <div>

            Ganador:
            {" "}
            {winner.winner_name}

          </div>

          <div>

            Estado:
            {" "}
            {winner.delivery_status}

          </div>

          {(winner.evidence_images ?? []).length > 0 && (

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              {(winner.evidence_images ?? []).map(
  (image, index) => (

                  <img
                    key={index}
                    src={image}
                    alt="evidencia"
                    className="
                      rounded-xl
                      border
                      border-slate-700
                    "
                  />

                )
              )}

            </div>

          )}

        </div>

      ))}

    </div>

  </div>

)}

          </div>

                </div>

      </div>

    </div>
  )
}
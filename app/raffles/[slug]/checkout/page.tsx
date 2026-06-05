"use client"

import {
  useEffect,
  useState
} from "react"

import {
  useParams
} from "next/navigation"

type RaffleData = {
  id: string
  slug: string
  title: string
  prize_title: string
  prize_description?: string
  cover_image: string
  ticket_price_clp: number
}

export default function CheckoutPage() {

  const params =
    useParams()

  const [raffle, setRaffle] =
    useState<RaffleData | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

    const [quantity, setQuantity] =
  useState(1)

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

      setRaffle(
        json?.raffle || null
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

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

        Cargando checkout...

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
        py-12
        px-4
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
          grid
          lg:grid-cols-2
          gap-8
        "
      >

        <div>

          <img
            src={
              raffle.cover_image
            }
            alt={
              raffle.title
            }
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
            bg-slate-900
            border
            border-slate-800
            rounded-3xl
            p-8
          "
        >

          <p
            className="
              text-blue-400
              font-semibold
              mb-2
            "
          >
            Checkout Seguro
          </p>

          <h1
            className="
              text-4xl
              font-black
              mb-4
            "
          >
            {raffle.title}
          </h1>

          <p
            className="
              text-slate-300
              mb-6
            "
          >
            {raffle.prize_title}
          </p>

          <div
            className="
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
            "
          >

            <div
              className="
                text-slate-400
                text-sm
              "
            >
              Valor Ticket
            </div>

<div
              className="
  text-4xl
  font-black
  mt-2
  mb-6
"
            >
              $
              {Number(
                raffle.ticket_price_clp
              ).toLocaleString("es-CL")}
            </div>

<div
  className="
    mt-6
    grid
    grid-cols-2
    md:grid-cols-4
    gap-3
  "
>

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

        <div className="text-sm">

          {
            value === 1
              ? "Básico"
              : value === 3
              ? "Popular ⭐"
              : value === 5
              ? "Recomendado 🔥"
              : "Premium 👑"
          }

        </div>

        <div className="text-xs opacity-70">

          {value} ticket{value > 1 ? "s" : ""}

        </div>

      </button>

    )

  })}

</div>

<div
  className="
    mt-6
    bg-slate-950
    border
    border-slate-800
    rounded-2xl
    p-4
  "
>

  <div
    className="
      flex
      justify-between
      text-slate-400
      mb-2
    "
  >

    <span>
      Cantidad
    </span>

    <span>
      {quantity}
    </span>

  </div>

  <div
    className="
      flex
      justify-between
      text-xl
      font-black
    "
  >

    <span>
      Total
    </span>

    <span>

      $
      {(
        Number(
          raffle.ticket_price_clp
        ) * quantity
      ).toLocaleString("es-CL")}

    </span>

  </div>

</div>
            
          </div>

        </div>

      </div>

    </div>

  )

}
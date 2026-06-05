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
              "
            >
              $
              {Number(
                raffle.ticket_price_clp
              ).toLocaleString("es-CL")}
            </div>

          </div>

        </div>

      </div>

    </div>

  )

}
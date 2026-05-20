"use client"

import {
  useEffect,
  useState
}
from "react"

import {
  useParams
}
from "next/navigation"

export default function RafflePage() {

  const params =
    useParams()

  const [raffle, setRaffle] =
    useState<any>(null)

  const [quantity, setQuantity] =
    useState(1)

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const res =
        await fetch(
          `/api/raffles/${params.slug}`
        )

      const json =
        await res.json()

      setRaffle(json)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  async function buyTickets() {

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
                raffle.id,

              quantity,

              user_email:
                email,

              source:
                "web"

            })
          }
        )

      const json =
        await res.json()

      if (json?.url) {

        window.location.href =
          json.url
      }

    } catch (error) {

      console.error(error)

    } finally {

      setProcessing(false)
    }
  }

  if (loading) {

    return (
      <div className="p-10">
        Cargando...
      </div>
    )
  }

  if (!raffle) {

    return (
      <div className="p-10">
        Sorteo no encontrado
      </div>
    )
  }

  return (

    <div
      className="
        max-w-5xl
        mx-auto
        p-6
        space-y-6
      "
    >

      <img
        src={raffle.cover_image}
        alt={raffle.title}
        className="
          w-full
          rounded-2xl
        "
      />

      <div>

        <h1 className="text-4xl font-bold">
          {raffle.title}
        </h1>

        <p className="mt-4 text-slate-600">
          {raffle.description}
        </p>

      </div>

      <div
        className="
          bg-white
          border
          rounded-2xl
          p-6
          space-y-4
        "
      >

        <div>

          <p className="text-sm text-slate-500">
            Valor ticket
          </p>

          <h2 className="text-3xl font-bold">

            $
            {Number(
              raffle.ticket_price
            ).toLocaleString()}

          </h2>

        </div>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        />

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Number(e.target.value)
            )
          }
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        />

        <button
          onClick={buyTickets}
          disabled={processing}
          className="
            w-full
            bg-black
            text-white
            py-4
            rounded-xl
          "
        >

          {processing
            ? "Procesando..."
            : "Comprar tickets"}

        </button>

      </div>

    </div>
  )
}
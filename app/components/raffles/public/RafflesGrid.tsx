"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Raffle = {
  id: string
  slug: string
  title: string
  short_description: string | null
  cover_image: string | null
  ticket_price_clp: number
  end_date: string | null
}

export default function RafflesGrid() {

  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    loadRaffles()

  }, [])

  async function loadRaffles() {

    try {

      const res =
        await fetch("/api/raffles")

      const data =
        await res.json()

      setRaffles(
        data.raffles || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }
  }

  if (loading) {

  return (

    <section className="py-20">

      <div className="max-w-7xl mx-auto px-6">

        <p className="text-slate-400">
          Cargando sorteos...
        </p>

      </div>

    </section>

  )
}

if (!raffles.length) {

  return (

    <section className="py-20">

      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-4xl font-black mb-4">
          Próximamente nuevos sorteos
        </h2>

        <p className="text-slate-400">
          Estamos preparando los primeros premios.
        </p>

      </div>

    </section>

  )
}

  return (

    <section
  id="sorteos-activos"
  className="py-20"
>

      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-12">

          <h2 className="text-4xl font-black text-white mb-4">
            Sorteos Activos
          </h2>

          <p className="text-slate-400">
            Participa y recibe tus tickets automáticamente por correo.
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
          "
        >

          {raffles.map((raffle) => (

            <Link
              key={raffle.id}
              href={`/raffles/${raffle.slug}`}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                overflow-hidden
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:border-blue-500
              "
            >

              <div className="aspect-[4/3] bg-slate-800">

                {raffle.cover_image && (

                  <img
                    src={raffle.cover_image}
                    alt={raffle.title}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                )}

              </div>

              <div className="p-6">

<div className="mb-4">

  <span
    className="
      inline-flex
      px-3
      py-1
      rounded-full
      bg-green-500/20
      text-green-400
      text-xs
      font-semibold
    "
  >
    Sorteo Activo
  </span>

</div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {raffle.title}
                </h3>

                {raffle.end_date && (

  <p className="text-sm text-slate-500 mb-3">

    Sorteo:
    {" "}
    {new Date(
      raffle.end_date
    ).toLocaleDateString("es-CL")}

  </p>

)}

<p className="text-slate-400 mb-6 line-clamp-2">

  {raffle.short_description}

</p>

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-slate-500">
                      Ticket desde
                    </p>

                    <p className="text-blue-400 font-bold text-xl">
                      $
                      {Number(
                        raffle.ticket_price_clp
                      ).toLocaleString("es-CL")}
                    </p>

                  </div>

                  <div
                    className="
                      px-4
                      py-2
                      rounded-xl
                      bg-blue-600
                      text-white
                      font-semibold
                    "
                  >
                    Comprar Tickets
                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </section>

  )
}
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

        <p className="text-[#002314]">
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

        <p className="text-[#002314]">
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

          <h2 className="text-4xl font-black text-[#002314] mb-4">
            Sorteos Activos
          </h2>

          <p className="text-[#002314]">
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
    group
    bg-[#002314] text-[#FAF9F5]
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

              <div
  className="
    relative
    aspect-[16/10]
    bg-slate-950
    flex
    items-center
    justify-center
    overflow-hidden
  "
>

  {raffle.cover_image && (

    <img
      src={raffle.cover_image}
      alt={raffle.title}
      className="
        w-full
        h-full
        object-contain
        transition-transform
        duration-500
        group-hover:scale-105
      "
    />

  )}

  <div
    className="
      absolute
      inset-x-0
      bottom-0
      h-24
      bg-gradient-to-t
      from-slate-950
      via-slate-950/60
      to-transparent
      pointer-events-none
    "
  />

</div>

              <div className="p-6">

<div className="mb-4">

  <span
    className="
      inline-flex
      px-3
      py-1
      rounded-full
      bg-cyan-500/15
text-cyan-400
      text-xs
      font-semibold
    "
  >
    Sorteo Activo
  </span>

</div>

                <h3 className="text-xl font-bold text-white mb-3">
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
                      bg-[#7048E8]
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
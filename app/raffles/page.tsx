import Link from "next/link"

import RafflesGrid from "@/app/components/raffles/public/RafflesGrid"
import HowItWorks from "@/app/components/raffles/public/HowItWorks"
import WinnersPreview from "@/app/components/raffles/public/WinnersPreview"
import TrustSection from "@/app/components/raffles/public/TrustSection"
import FinalCTA from "@/app/components/raffles/public/FinalCTA"

async function getFeaturedRaffle() {

  try {

    const res =
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/raffles`,
        {
          cache: "no-store"
        }
      )

    const data =
      await res.json()

    return data?.raffles?.[0] || null

  } catch {

    return null

  }

}

export default async function RafflesHomePage() {

  const featuredRaffle =
    await getFeaturedRaffle()

  return (

    <div className="bg-slate-950 text-white">

      <section className="min-h-[65vh] flex items-center">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

          {/* IZQUIERDA */}

          <div>

            <span
              className="
                text-cyan-400
                font-semibold
                tracking-[0.2em]
                uppercase
              "
            >
              IMPULSASUEÑOS
            </span>

            <h1 className="text-6xl font-black mt-4 leading-tight">

              Hay historias que
              todavía no terminan.

            </h1>

            <p className="text-slate-300 text-xl mt-6 max-w-2xl">

              No prometemos milagros.

              <br />
              <br />

              Creamos oportunidades para que personas reales
              puedan escribir un nuevo capítulo en sus vidas.

            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <Link
                href="#sorteos-activos"
                className="
                  bg-cyan-500
                  hover:bg-cyan-400
                  text-slate-950
                  px-8
                  py-4
                  rounded-xl
                  font-bold
                  transition
                "
              >
                Ver Sorteos
              </Link>

              <Link
                href="/raffles/my-tickets"
                className="
                  border
                  border-slate-700
                  px-8
                  py-4
                  rounded-xl
                  text-white
                "
              >
                Buscar Mis Tickets
              </Link>

            </div>

          </div>

          {/* DERECHA */}

          <div>

            {featuredRaffle ? (

              <Link
                href={`/raffles/${featuredRaffle.slug}`}
                className="
                  block
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-800
                  bg-slate-900
                  hover:border-cyan-500
                  transition-all
                "
              >

                <img
                  src={featuredRaffle.cover_image}
                  alt={featuredRaffle.title}
                  className="
                    w-full
                    h-[340px]
                    object-cover
                  "
                />

                <div className="p-6">

                  <div
                    className="
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      bg-cyan-500/20
                      text-cyan-400
                      text-xs
                      font-semibold
                      mb-4
                    "
                  >
                    Sorteo Destacado
                  </div>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      mb-3
                    "
                  >
                    {featuredRaffle.title}
                  </h3>

                  <p
                    className="
                      text-slate-400
                      line-clamp-3
                    "
                  >
                    {
                      featuredRaffle.short_description ||
                      featuredRaffle.description
                    }
                  </p>

                  <div className="mt-6 flex items-center justify-between">

                    <div>

                      <p className="text-xs text-slate-500">
                        Participación desde
                      </p>

                      <p className="text-cyan-400 font-bold text-xl">

                        $
                        {Number(
                          featuredRaffle.ticket_price_clp
                        ).toLocaleString("es-CL")}

                      </p>

                    </div>

                    <div
                      className="
                        px-4
                        py-2
                        rounded-xl
                        bg-cyan-500
                        text-slate-950
                        font-bold
                      "
                    >
                      Participar
                    </div>

                  </div>

                </div>

              </Link>

            ) : (

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-800
                  bg-slate-900
                  h-[500px]
                  flex
                  items-center
                  justify-center
                "
              >
                Próximamente
              </div>

            )}

          </div>

        </div>

      </section>

      <RafflesGrid />

      <HowItWorks />

      <WinnersPreview />

      <TrustSection />

      <FinalCTA />

    </div>

  )

}
import { redirect }
from "next/navigation"

import { createClient }
from "@supabase/supabase-js"

import Link from "next/link"

export const dynamic = "force-dynamic"

import RafflesGrid from "@/app/components/raffles/public/RafflesGrid"
import HowItWorks from "@/app/components/raffles/public/HowItWorks"
import WinnersPreview from "@/app/components/raffles/public/WinnersPreview"
import TrustSection from "@/app/components/raffles/public/TrustSection"
import FinalCTA from "@/app/components/raffles/public/FinalCTA"

async function getFeaturedRaffle() {

  try {

   const res =
  await fetch(
    "/api/raffles",
    {
      cache: "no-store"
    }
  )

    const data =
      await res.json()

    return data?.raffles?.[0] || null

  } catch (error) {

    console.error(error)

    return null

  }

}

export default async function RafflesHomePage() {

  const supabase = createClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.SUPABASE_SERVICE_ROLE_KEY!

  )

  const {

    data: settings

  } =
    await supabase

      .schema("raffles")

      .from("public_site_settings")

      .select("site_mode")

      .eq(
        "id",
        "00000000-0000-0000-0000-000000000001"
      )

      .single()

  if (

    settings?.site_mode === "landing"

  ) {

    redirect("/raffles/landing")

  }

  const featuredRaffle =
    await getFeaturedRaffle()

  return (

    <div className="bg-slate-950 text-white">

      <section className="py-16 lg:py-24">

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

            <h1 className="text-5xl lg:text-7xl font-black mt-4 leading-[0.95]">

              Hay historias que
              todavía no terminan.

            </h1>

            <p className="text-slate-300 text-lg mt-6 max-w-xl leading-relaxed">

  No prometemos milagros.

  Creamos oportunidades para que personas reales
  puedan escribir un nuevo capítulo en sus vidas.

</p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">

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
    object-contain
    bg-slate-950
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
    text-white
    group-hover:text-cyan-400
    transition-colors
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
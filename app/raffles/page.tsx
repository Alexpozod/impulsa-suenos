import Link from "next/link"

import RafflesGrid from "@/app/components/raffles/public/RafflesGrid"
import HowItWorks from "@/app/components/raffles/public/HowItWorks"
import WinnersPreview from "@/app/components/raffles/public/WinnersPreview"
import TrustSection from "@/app/components/raffles/public/TrustSection"
import FinalCTA from "@/app/components/raffles/public/FinalCTA"

export default function RafflesHomePage() {
  return (
    <div className="bg-slate-950 text-white">

      <section className="min-h-[80vh] flex items-center">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <span className="text-blue-400 font-semibold">
              IMPULSASUEÑOS SORTEOS
            </span>

            <h1 className="text-6xl font-black mt-4 leading-tight">
              Impulsando sueños,
              una participación a la vez.
            </h1>

            <p className="text-slate-300 text-xl mt-6 max-w-2xl">
              Participa en iniciativas reales,
              conoce historias inspiradoras y sé parte
              de oportunidades que pueden cambiar vidas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <Link
  href="#sorteos-activos"
  className="
px-8
py-4
rounded-2xl
font-bold
text-white
bg-gradient-to-r
from-emerald-500
via-cyan-500
to-violet-600
shadow-lg
shadow-cyan-500/20
"
>
  Ver Sorteos
</Link>

              <Link
  href="/raffles/my-tickets"
  className="border border-slate-700 px-8 py-4 rounded-2xl"
>
  Buscar Mis Tickets
</Link>

            </div>

          </div>

          <div>

            <div className="aspect-square rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              Premio Destacado
            </div>

          </div>

        </div>

      </section>

      {/* SORTEOS ACTIVOS */}
      <RafflesGrid />

      <HowItWorks />

      <WinnersPreview />

      <TrustSection />

      <FinalCTA />

    </div>
  )
}
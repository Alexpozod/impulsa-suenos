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
              Gana premios increíbles desde $3.000
            </h1>

            <p className="text-slate-300 text-xl mt-6">
              Participa en sorteos transparentes,
              recibe tus tickets por correo
              y consulta los resultados públicamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <Link
  href="/raffles"
  className="bg-blue-600 px-8 py-4 rounded-2xl font-bold"
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
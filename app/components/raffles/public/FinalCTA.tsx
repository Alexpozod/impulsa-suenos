import Link from "next/link"

export default function FinalCTA() {

  return (

    <section className="py-24">

      <div className="max-w-4xl mx-auto px-6">

        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-[#002314] text-[#FAF9F5]
            p-8 md:p-10
            text-center
          "
        >

          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">

            Cada participación puede cambiar una historia.

          </h2>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">

            Conoce iniciativas reales, participa de forma segura
y sigue cada proceso con total transparencia.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="#sorteos-activos"
              className="
                bg-[#7048E8]
                
                px-8
                py-4
                rounded-2xl
                font-bold
                text-white
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
                rounded-2xl
                text-white
              "
            >
              Mis Participaciones
            </Link>

          </div>

        </div>

      </div>

    </section>

  )
}
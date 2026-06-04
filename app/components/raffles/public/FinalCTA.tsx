import Link from "next/link"

export default function FinalCTA() {

  return (

    <section className="py-24">

      <div className="max-w-5xl mx-auto px-6">

        <div
          className="
            rounded-[40px]
            border
            border-slate-800
            bg-gradient-to-br
            from-blue-600/20
            to-slate-900
            p-10
            md:p-16
            text-center
          "
        >

          <div className="text-6xl mb-6">
            🎁
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">

            Tu próximo premio podría estar a un ticket de distancia

          </h2>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">

            Participa desde cualquier dispositivo,
            recibe tus tickets automáticamente
            y sigue los resultados de forma transparente.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="/raffles"
              className="
                bg-blue-600
                hover:bg-blue-500
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
              Buscar Mis Tickets
            </Link>

          </div>

        </div>

      </div>

    </section>

  )
}
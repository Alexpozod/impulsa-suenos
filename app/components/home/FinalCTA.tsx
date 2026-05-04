'use client'

import { useRouter } from "next/navigation"

export default function FinalCTA({ onCreate }: { onCreate: () => void }) {

  const router = useRouter()

  return (
    <section className="py-10 px-6 bg-white">

      <div className="max-w-6xl mx-auto">

        <div className="
          relative
          rounded-[32px]
          px-10 md:px-16 py-14
          text-center
          text-white
          overflow-hidden
          bg-gradient-to-br from-green-700 via-green-600 to-green-800
          shadow-xl
        ">

          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <span className="text-2xl">❤</span>
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-6">
            Tú eres el impulso que alguien está esperando
          </h2>

          {/* TEXT */}
          <p className="text-green-100 text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            Cada donación, por pequeña que sea, tiene el poder de transformar una vida.
            Crea tu campaña o apoya una causa hoy.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">

            <button
              onClick={onCreate}
              className="
                bg-white text-green-700
                px-6 py-3 rounded-xl
                font-semibold
                shadow-lg
                hover:scale-105 hover:shadow-xl
                transition-all
              "
            >
              Crear mi campaña →
            </button>

            <button
                onClick={() => router.push("/campaigns")}
                className="
                  border border-white/50 text-white
                  px-8 py-4 rounded-xl
                  font-semibold
                  hover:bg-white hover:text-green-700
                  transition-all
                "
              >
                Explorar campañas
              </button>

          </div>

          {/* TRUST */}
          <p className="text-xs text-green-200">
            Sin costos ocultos · Pagos seguros · Retiros rápidos
          </p>

        </div>

      </div>

    </section>
  )
}
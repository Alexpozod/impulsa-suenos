import Link from "next/link"

export default function WinnersPreview() {

  return (

    <section className="py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <h2 className="text-4xl font-black text-white mb-4">
            Ganadores Verificados
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Publicamos los resultados y evidencias de cada sorteo para garantizar transparencia.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-4">
              🏆
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Próximamente
            </h3>

            <p className="text-slate-400">
              Los primeros ganadores aparecerán aquí.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-4">
              📸
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Evidencias
            </h3>

            <p className="text-slate-400">
              Fotografías, videos y comprobantes de entrega.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-4">
              🔍
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Resultados Públicos
            </h3>

            <p className="text-slate-400">
              Consulta los resultados de cada sorteo cuando estén disponibles.
            </p>

          </div>

        </div>

        <div className="text-center mt-12">

          <Link
            href="/raffles/winners"
            className="
              inline-flex
              bg-blue-600
              hover:bg-blue-500
              px-8
              py-4
              rounded-2xl
              font-bold
              transition
            "
          >
            Ver Ganadores
          </Link>

        </div>

      </div>

    </section>

  )
}
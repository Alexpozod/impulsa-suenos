import Link from "next/link"

export default function WinnersPreview() {

  return (

    <section className="py-16">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-10">

          <h2 className="text-4xl font-black text-white mb-4">
            Transparencia Garantizada
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada iniciativa cuenta con bases públicas, registros verificables y resultados transparentes.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">

            <div className="text-4xl mb-3">
              📋
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
  Bases Públicas
</h3>

<p className="text-slate-400">
  Cada iniciativa incluye reglas, condiciones y fechas claramente definidas.
</p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">

            <div className="text-4xl mb-3">
              🔐
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Participaciones Registradas
            </h3>

            <p className="text-slate-400">
              Todas las participaciones quedan registradas y verificadas dentro del sistema.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">

            <div className="text-4xl mb-3">
              ✅
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Resultados Transparentes
            </h3>

            <p className="text-slate-400">
              Los resultados y evidencias serán publicados cuando cada iniciativa finalice.
            </p>

          </div>

        </div>

        <div className="text-center mt-12">

          <Link
            href="/raffles/faq"
            className="
              inline-flex
              bg-cyan-500
hover:bg-cyan-400
text-slate-950
              px-8
              py-4
              rounded-2xl
              font-bold
              transition
            "
          >
            Conocer Más
          </Link>

        </div>

      </div>

    </section>

  )
}
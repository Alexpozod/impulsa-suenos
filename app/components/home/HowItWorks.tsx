'use client'

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">

        <h2 className="text-3xl font-bold mb-12">
          ¿Cómo funciona?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          <div>
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="font-semibold mb-2">Crea tu campaña</h3>
            <p className="text-gray-500 text-sm">
              Publica tu historia en minutos.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-4">📢</div>
            <h3 className="font-semibold mb-2">Comparte</h3>
            <p className="text-gray-500 text-sm">
              Difunde en redes y consigue apoyo.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-4">💸</div>
            <h3 className="font-semibold mb-2">Recibe fondos</h3>
            <p className="text-gray-500 text-sm">
              Retira de forma segura.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
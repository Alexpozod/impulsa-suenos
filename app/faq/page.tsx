export default function FAQ() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-10 text-center">
          Preguntas frecuentes
        </h1>

        <div className="space-y-6">

          <div>
            <h2 className="font-semibold">¿Cómo participo?</h2>
            <p className="text-gray-600">
              Comprando tickets en cualquier campaña activa.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">¿Cómo se elige el ganador?</h2>
            <p className="text-gray-600">
              Mediante un sistema aleatorio transparente.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">¿Es seguro pagar?</h2>
            <p className="text-gray-600">
              Sí, utilizamos MercadoPago para garantizar seguridad.
            </p>
          </div>

        </div>

      </div>

    </main>
  )
}

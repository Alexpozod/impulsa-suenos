export default function FAQPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-bold mb-8">
        Preguntas Frecuentes
      </h1>

      <div className="space-y-6">

        <div>
          <h2 className="font-semibold">
            ¿Cómo funcionan las campañas?
          </h2>
          <p>
            Puedes crear campañas para recaudar fondos o participar en sorteos.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">
            ¿Cómo se compran tickets?
          </h2>
          <p>
            A través de MercadoPago. Una vez aprobado, recibes tus tickets por correo.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">
            ¿Hay comisiones?
          </h2>
          <p>
            Sí. Se descuenta automáticamente del monto recaudado.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">
            ¿Qué pasa si se cancela una campaña?
          </h2>
          <p>
            Se puede realizar un reembolso parcial descontando costos operativos.
          </p>
        </div>

      </div>

    </main>
  )
}

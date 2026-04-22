'use client'

export default function Trust() {
  return (
    <section className="py-24 bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h2 className="text-3xl font-bold mb-6">
            Seguridad y transparencia
          </h2>

          <p className="text-gray-600 mb-6">
            Cada donación está protegida y cada campaña verificada.
          </p>

          <ul className="space-y-3 text-sm text-gray-600">
            <li>✔ Pagos encriptados</li>
            <li>✔ Fondos rastreables</li>
            <li>✔ Verificación de campañas</li>
          </ul>
        </div>

        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85"
          className="rounded-2xl h-[350px] w-full object-cover"
        />

      </div>
    </section>
  )
}
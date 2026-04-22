'use client'

export default function Stats() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

        <div>
          <p className="text-3xl font-extrabold text-green-600">$2.4M+</p>
          <p className="text-sm text-gray-500">Recaudado</p>
        </div>

        <div>
          <p className="text-3xl font-extrabold">1,800+</p>
          <p className="text-sm text-gray-500">Campañas activas</p>
        </div>

        <div>
          <p className="text-3xl font-extrabold">12,000+</p>
          <p className="text-sm text-gray-500">Personas ayudadas</p>
        </div>

        <div>
          <p className="text-3xl font-extrabold">15</p>
          <p className="text-sm text-gray-500">Países</p>
        </div>

      </div>
    </section>
  )
}
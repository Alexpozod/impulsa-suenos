'use client'

export const dynamic = "force-dynamic"

import { useRouter } from 'next/navigation'

export default function FailurePage() {

  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">

        <h1 className="text-2xl font-bold mb-4 text-red-600">
          ❌ Pago rechazado
        </h1>

        <p className="text-gray-600 mb-6">
          Hubo un problema con tu pago. Puedes intentarlo nuevamente.
        </p>

        <button
          onClick={() => router.back()}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Reintentar
        </button>

      </div>

    </main>
  )
}

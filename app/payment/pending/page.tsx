'use client'

export const dynamic = "force-dynamic"

import { useRouter } from 'next/navigation'

export default function PendingPage() {

  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">

        <h1 className="text-2xl font-bold mb-4">
          ⏳ Pago en proceso
        </h1>

        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te avisaremos cuando se confirme.
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg"
        >
          Ir al dashboard
        </button>

      </div>

    </main>
  )
}

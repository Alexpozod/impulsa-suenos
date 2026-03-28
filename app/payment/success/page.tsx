'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessPage() {

  const params = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const paymentId = params.get('payment_id')

  useEffect(() => {
    if (paymentId) {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }, [paymentId])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg text-center">

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          🎉 Pago exitoso
        </h1>

        <p className="text-gray-600 mb-6">
          Tu compra fue procesada correctamente.
        </p>

        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-sm">
          ID de pago: <b>{paymentId}</b>
        </div>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Ir a mi dashboard
          </button>

          <button
            onClick={() => router.push('/campaigns')}
            className="w-full border py-3 rounded-xl"
          >
            Ver más campañas
          </button>

        </div>

      </div>

    </main>
  )
}

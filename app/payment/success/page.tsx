'use client'

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessPage() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState('Procesando pago...')

  useEffect(() => {

    const statusParam = searchParams.get('status')

    if (statusParam === 'approved') {
      setStatus('✅ Pago aprobado')
    } else if (statusParam === 'pending') {
      setStatus('⏳ Pago pendiente')
    } else {
      setStatus('❌ Pago rechazado')
    }

  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">

        <h1 className="text-2xl font-bold mb-4">
          Resultado del pago
        </h1>

        <p className="text-gray-600 mb-6">
          {status}
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Ir al dashboard
        </button>

      </div>

    </main>
  )
}

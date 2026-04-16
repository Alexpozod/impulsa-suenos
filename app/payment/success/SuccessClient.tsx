'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessClient() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState('Procesando...')
  const [amount, setAmount] = useState(0)
  const [campaign, setCampaign] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {

    const payment_id = searchParams.get('payment_id')
    const statusParam = searchParams.get('status')

    if (statusParam === 'approved') {
      setStatus('✅ Pago aprobado')
    } else if (statusParam === 'pending') {
      setStatus('⏳ Pago pendiente')
    } else {
      setStatus('❌ Pago rechazado')
    }

    if (payment_id) {
      fetchWithRetry(payment_id)
    } else {
      setLoadingData(false)
    }

  }, [searchParams])

  const fetchWithRetry = async (payment_id: string, attempts = 0) => {

    try {

      const res = await fetch(`/api/payment-info?payment_id=${payment_id}`)
      const data = await res.json()

      console.log("PAYMENT DATA:", data)

      if (data?.amount && data.amount > 0) {
        setAmount(Number(data.amount))
        setCampaign(data.campaign)
        setLoadingData(false)
        return
      }

      if (attempts < 10) {
        setTimeout(() => {
          fetchWithRetry(payment_id, attempts + 1)
        }, 1500)
      } else {
        setLoadingData(false)
      }

    } catch (err) {
      console.error("Error loading payment:", err)
      setLoadingData(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">

        <h1 className="text-2xl font-bold mb-4">
          Resultado del pago
        </h1>

        <p className="text-lg mb-4">{status}</p>

        {loadingData && (
          <p className="text-gray-500 mb-4">
            Procesando confirmación de pago...
          </p>
        )}

        {!loadingData && (
          <>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Monto pagado</p>
              <p className="text-xl font-bold text-green-600">
                ${amount.toLocaleString()}
              </p>
            </div>

            {campaign && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Campaña</p>
                <p className="font-semibold">{campaign.title}</p>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push('/campaigns')}
            className="bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Seguir donando
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="border py-3 rounded-lg font-semibold"
          >
            Ir al dashboard
          </button>

        </div>

      </div>

    </main>
  )
}
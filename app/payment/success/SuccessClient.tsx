'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessClient() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState('Procesando...')
  const [tickets, setTickets] = useState<any[]>([])
  const [amount, setAmount] = useState(0)
  const [campaign, setCampaign] = useState<any>(null)

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
      loadData(payment_id)
    }

  }, [searchParams])

  // 🔥 FIX REAL: retry hasta que webhook termine
  const loadData = async (payment_id: string) => {

    let attempts = 0
    let success = false

    while (attempts < 6 && !success) {

      try {
        const res = await fetch(`/api/payment-info?payment_id=${payment_id}`)
        const data = await res.json()

        if (data?.tickets?.length > 0) {

          setTickets(data.tickets || [])
          setAmount(data.amount || 0)
          setCampaign(data.campaign || null)

          success = true

        } else {
          // ⏳ esperar webhook
          await new Promise(r => setTimeout(r, 1500))
          attempts++
        }

      } catch (err) {
        console.log("❌ ERROR FETCH PAYMENT INFO:", err)
        await new Promise(r => setTimeout(r, 1500))
        attempts++
      }
    }

    if (!success) {
      console.log("⚠️ tickets aún no disponibles")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">

        <h1 className="text-2xl font-bold mb-4">
          Resultado del pago
        </h1>

        <p className="text-lg mb-4">{status}</p>

        {/* MONTO */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Monto pagado</p>
          <p className="text-xl font-bold text-green-600">
            ${amount.toLocaleString()}
          </p>
        </div>

        {/* CAMPAÑA */}
        {campaign && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm">Campaña</p>
            <p className="font-semibold">{campaign.title}</p>
          </div>
        )}

        {/* TICKETS */}
        {tickets.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">
              🎟️ Tu ticket
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {tickets.map((t) => (
                <span
                  key={t.id}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {t.ticket_number}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push('/campaigns')}
            className="bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            🎟️ Seguir participando
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
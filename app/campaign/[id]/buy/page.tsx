'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BuyPage() {

  const { id } = useParams()

  const [campaign, setCampaign] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      setCampaign(data)
    }

    fetchCampaign()
  }, [id])

  const handleBuy = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          quantity
        })
      })

      const data = await res.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert('Error al iniciar pago')
      }

    } catch (err) {
      alert('Error inesperado')
    }

    setLoading(false)
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  const total = quantity * campaign.ticket_price

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IZQUIERDA */}
        <div>

          <h1 className="text-2xl font-bold mb-4">
            {campaign.title}
          </h1>

          <img
            src={campaign.image_url}
            className="w-full rounded-xl mb-4"
          />

          <p className="text-gray-600 text-sm">
            Estás participando en esta campaña. Cada ticket es una oportunidad de ganar.
          </p>

        </div>

        {/* DERECHA */}
        <div className="bg-white p-6 rounded-2xl shadow-md">

          <h2 className="text-lg font-semibold mb-4">
            Compra de tickets
          </h2>

          {/* PRECIO */}
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Precio por ticket</span>
            <span className="font-bold">
              ${campaign.ticket_price}
            </span>
          </div>

          {/* CANTIDAD */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">
              Cantidad
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border p-3 rounded-lg mt-1"
            />
          </div>

          {/* TOTAL */}
          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total</span>
            <span>${total}</span>
          </div>

          {/* BOTÓN */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar con MercadoPago'}
          </button>

          {/* SEGURIDAD */}
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>🔒 Pago 100% seguro</p>
            <p>🎟️ Tickets automáticos</p>
            <p>🧾 Confirmación inmediata</p>
          </div>

        </div>

      </div>

    </main>
  )
}

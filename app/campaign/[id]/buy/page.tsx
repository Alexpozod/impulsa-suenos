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
    if (!quantity || quantity <= 0) {
      alert("Cantidad inválida")
      return
    }

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
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IZQUIERDA */}
        <div>

          <h1 className="text-3xl font-extrabold mb-4">
            {campaign.title}
          </h1>

          <img
            src={campaign.image_url || "https://via.placeholder.com/600"}
            className="w-full rounded-2xl mb-6 shadow-md"
          />

          <div className="bg-white border rounded-xl p-4 text-sm text-gray-600 space-y-2">
            <p>🎟️ Cada ticket = 1 oportunidad de ganar</p>
            <p>🏆 Sorteo verificable y transparente</p>
            <p>🔒 Pago seguro con MercadoPago</p>
          </div>

        </div>

        {/* DERECHA (CHECKOUT) */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border">

          <h2 className="text-xl font-bold mb-6">
            Compra tus tickets
          </h2>

          {/* PRECIO */}
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-gray-500">Precio por ticket</span>
            <span className="font-semibold">
              ${campaign.ticket_price}
            </span>
          </div>

          {/* SELECTOR RÁPIDO */}
          <div className="grid grid-cols-4 gap-2 mb-4">

            {[1, 3, 5, 10].map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`
                  border rounded-lg py-2 text-sm font-semibold
                  ${quantity === q 
                    ? 'bg-green-600 text-white border-green-600'
                    : 'hover:bg-gray-100'}
                `}
              >
                {q}
              </button>
            ))}

          </div>

          {/* INPUT */}
          <div className="mb-5">
            <label className="text-sm text-gray-500">
              Cantidad personalizada
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* TOTAL */}
          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total</span>
            <span className="text-green-600">
              ${total.toLocaleString()}
            </span>
          </div>

          {/* BOTÓN */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar ahora'}
          </button>

          {/* CONFIANZA */}
          <div className="mt-6 text-xs text-gray-500 space-y-1 text-center">
            <p>🔒 Pago 100% seguro</p>
            <p>🎟️ Tickets automáticos</p>
            <p>🧾 Confirmación inmediata</p>
          </div>

        </div>

      </div>

    </main>
  )
}

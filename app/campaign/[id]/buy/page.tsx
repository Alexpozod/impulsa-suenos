'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BuyPage() {

  const { id } = useParams()
  const searchParams = useSearchParams()

  const [campaign, setCampaign] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const [quantity, setQuantity] = useState(1)
  const [selectedPack, setSelectedPack] = useState<any>(null)

  const [loading, setLoading] = useState(false)

  // 📦 LOAD DATA
  useEffect(() => {

    const load = async () => {

      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)

      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      setCampaign(data)

      // 🎯 PACK DESDE URL
      const packQty = searchParams.get('pack')

      if (packQty && data?.ticket_pack) {
        const pack = data.ticket_pack.find((p: any) => p.qty == packQty)
        if (pack) {
          setSelectedPack(pack)
          setQuantity(pack.qty)
        }
      }
    }

    load()

  }, [id])

  // 💰 TOTAL
  const getTotal = () => {
    if (!campaign) return 0

    if (selectedPack) {
      return Number(selectedPack.price)
    }

    return quantity * Number(campaign.ticket_price || 1000)
  }

  // 💳 PAGO
  const handlePay = async () => {

    if (!user) {
      alert('Debes iniciar sesión')
      return
    }

    setLoading(true)

    try {
      const amount = getTotal()

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          campaign_id: id,
          user_email: user.email
        })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error iniciando pago')
      }

    } catch (err) {
      alert('Error inesperado')
    }

    setLoading(false)
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando campaña...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* ================= IZQUIERDA ================= */}
        <div>

          <h1 className="text-2xl font-bold mb-4">
            {campaign.title}
          </h1>

          <img
            src={campaign.image_url || "https://via.placeholder.com/500"}
            className="w-full rounded-xl mb-4"
          />

          <p className="text-sm text-gray-600">
            Estás participando en esta campaña. Cada ticket aumenta tus probabilidades de ganar.
          </p>

        </div>

        {/* ================= DERECHA ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border">

          <h2 className="text-lg font-semibold mb-4">
            🎟️ Compra de tickets
          </h2>

          {/* 🎯 PACKS */}
          {campaign.ticket_pack?.length > 0 && (
            <div className="mb-6 space-y-2">

              <p className="text-sm text-gray-600 mb-2">
                Packs recomendados
              </p>

              {campaign.ticket_pack.map((pack: any, i: number) => (

                <button
                  key={i}
                  onClick={() => {
                    setSelectedPack(pack)
                    setQuantity(pack.qty)
                  }}
                  className={`w-full border p-3 rounded-lg text-left transition ${
                    selectedPack?.qty === pack.qty
                      ? 'border-green-600 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  🎟️ {pack.qty} tickets  
                  <span className="float-right font-bold">
                    ${pack.price}
                  </span>
                </button>

              ))}

            </div>
          )}

          {/* ✍️ CUSTOM */}
          <div className="mb-6">

            <label className="text-sm text-gray-600">
              Cantidad personalizada
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setSelectedPack(null)
                setQuantity(Number(e.target.value))
              }}
              className="w-full border p-3 rounded-lg mt-1"
            />

          </div>

          {/* 💰 PRECIO UNITARIO */}
          <div className="flex justify-between mb-2 text-sm text-gray-600">
            <span>Precio por ticket</span>
            <span>${campaign.ticket_price || 1000}</span>
          </div>

          {/* 💵 TOTAL */}
          <div className="flex justify-between mb-6 text-xl font-bold">
            <span>Total</span>
            <span>${getTotal().toLocaleString()}</span>
          </div>

          {/* 💳 CTA */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar ahora'}
          </button>

          {/* 🔒 CONFIANZA */}
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

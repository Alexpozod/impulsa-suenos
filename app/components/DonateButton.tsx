'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function DonateButton({
  campaignId
}: {
  campaignId: string
}) {

  const [loading, setLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  const ticketPrice = 1000

  const packs = [
    { label: '1 Ticket', amount: 1000 },
    { label: '🔥 3 Tickets', amount: 2500, popular: true },
    { label: '🚀 5 Tickets', amount: 4000 }
  ]

  const handleBuy = async (amount: number) => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert('Debes iniciar sesión')
      setLoading(false)
      return
    }

    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        campaign_id: campaignId,
        user_email: userData.user.email
      })
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Error al crear pago')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">

      {/* 🔥 PACKS */}
      <div className="grid grid-cols-1 gap-3">

        {packs.map((p, i) => (
          <button
            key={i}
            onClick={() => handleBuy(p.amount)}
            disabled={loading}
            className={`
              w-full p-4 rounded-xl border text-left transition
              ${p.popular
                ? 'border-green-600 bg-green-50 scale-105 shadow-md'
                : 'bg-white hover:shadow'}
            `}
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold">{p.label}</p>

                {p.popular && (
                  <p className="text-xs text-green-600 font-bold">
                    ⭐ Más elegido
                  </p>
                )}
              </div>

              <p className="font-bold text-green-600">
                ${p.amount.toLocaleString()}
              </p>

            </div>

          </button>
        ))}

      </div>

      {/* ✍️ MONTO PERSONALIZADO */}
      <div className="pt-2 border-t">

        <input
          type="number"
          placeholder="Monto personalizado"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-full border p-3 rounded-lg mb-2"
        />

        <button
          onClick={() => handleBuy(Number(customAmount))}
          disabled={loading || !customAmount}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold"
        >
          Comprar monto personalizado
        </button>

      </div>

    </div>
  )
}

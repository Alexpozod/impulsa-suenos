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
  const [tip, setTip] = useState(0)

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

    const total = amount + tip

    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        campaign_id: campaignId,
        user_email: userData.user.email,
        base_amount: amount,
        platform_tip: tip
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
          <div className="flex justify-between">

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

      {/* 💰 DONACIÓN PLATAFORMA */}
      <div className="bg-gray-50 p-4 rounded-xl border">

        <p className="text-sm font-semibold mb-2">
          ❤️ Apoyar ImpulsaSueños
        </p>

        <div className="flex gap-2">

          {[0, 500, 1000].map((t) => (
            <button
              key={t}
              onClick={() => setTip(t)}
              className={`
                px-3 py-2 rounded-lg text-sm border
                ${tip === t
                  ? 'bg-green-600 text-white'
                  : 'bg-white'}
              `}
            >
              {t === 0 ? 'No' : `$${t}`}
            </button>
          ))}

        </div>

        <p className="text-xs text-gray-500 mt-2">
          Nos ayuda a mantener la plataforma 🙌
        </p>

      </div>

      {/* ✍️ CUSTOM */}
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

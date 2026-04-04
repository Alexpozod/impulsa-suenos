'use client'

import { useState } from 'react'

export default function DonationBox({
  campaign_id
}: {
  campaign_id: string
}) {

  const [amount, setAmount] = useState(5000)
  const [loading, setLoading] = useState(false)

  const presets = [2000, 5000, 10000, 20000]

  const donate = async () => {
    setLoading(true)

    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        campaign_id,
        user_email: "guest@guest.com"
      })
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert("Error iniciando pago")
    }

    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-4">

      <h3 className="font-bold text-lg">
        💖 Apoya esta causa
      </h3>

      {/* PRESETS */}
      <div className="grid grid-cols-4 gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`py-2 rounded-lg border text-sm ${
              amount === p ? 'bg-black text-white' : ''
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border p-2 rounded-lg"
      />

      {/* CTA */}
      <button
        onClick={donate}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg"
      >
        {loading ? "Procesando..." : "Donar ahora"}
      </button>

      {/* TRUST */}
      <p className="text-xs text-gray-500 text-center">
        🔒 Pago seguro con MercadoPago
      </p>

    </div>
  )
}
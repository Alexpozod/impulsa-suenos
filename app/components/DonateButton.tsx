'use client'

import { useState } from 'react'

export default function DonateButton({
  campaignId,
  ticketPrice = 1000
}: {
  campaignId: string
  ticketPrice?: number
}) {

  const [amount, setAmount] = useState<number>(ticketPrice)
  const [tickets, setTickets] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState<number>(0)
  const [custom, setCustom] = useState(false)

  // 🎯 PACKS (puedes luego traerlos desde DB)
  const packs = [
    { tickets: 1, price: ticketPrice },
    { tickets: 3, price: ticketPrice * 2.5 }, // 🔥 descuento
    { tickets: 5, price: ticketPrice * 4 },
    { tickets: 10, price: ticketPrice * 7.5 },
  ]

  const selectPack = (p: any) => {
    setCustom(false)
    setTickets(p.tickets)
    setAmount(Math.round(p.price))
  }

  const handleCustom = (value: number) => {
    setCustom(true)
    setAmount(value)
    setTickets(Math.floor(value / ticketPrice))
  }

  const total = amount + tip

  const donate = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          platform_tip: tip,
          campaign_id: campaignId,
          user_email: localStorage.getItem('user_email') // ⚠️ puedes mejorar esto luego
        })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al crear pago')
      }

    } catch (err) {
      console.error(err)
      alert('Error inesperado')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">

      {/* 🎟️ PACKS */}
      <div className="grid grid-cols-2 gap-2">

        {packs.map((p, i) => (
          <button
            key={i}
            onClick={() => selectPack(p)}
            className={`p-3 rounded-xl border text-sm font-semibold transition
              ${tickets === p.tickets && !custom
                ? 'bg-green-600 text-white'
                : 'bg-white hover:bg-gray-100'
              }
            `}
          >
            🎟️ {p.tickets} ticket{p.tickets > 1 && 's'}
            <div className="text-xs opacity-80">
              ${Math.round(p.price).toLocaleString()}
            </div>
          </button>
        ))}

      </div>

      {/* 💰 INPUT PERSONALIZADO */}
      <div>
        <input
          type="number"
          placeholder="Monto personalizado"
          className="w-full border p-3 rounded-lg"
          onChange={(e) => handleCustom(Number(e.target.value))}
        />
      </div>

      {/* 🎯 INFO */}
      <div className="text-sm text-gray-600 text-center">
        Obtienes <b>{tickets}</b> ticket(s)
      </div>

      {/* ❤️ DONACIÓN A PLATAFORMA */}
      <div className="bg-gray-50 p-3 rounded-xl text-sm">

        <label className="flex items-center justify-between cursor-pointer">

          <span>❤️ Apoyar la plataforma</span>

          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                setTip(Math.round(amount * 0.1)) // sugerido 10%
              } else {
                setTip(0)
              }
            }}
          />

        </label>

        {tip > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Aporte: ${tip.toLocaleString()}
          </div>
        )}

      </div>

      {/* 💵 TOTAL */}
      <div className="text-center">

        <p className="text-sm text-gray-500">Total</p>

        <p className="text-2xl font-bold text-green-600">
          ${total.toLocaleString()}
        </p>

      </div>

      {/* 🚀 CTA */}
      <button
        onClick={donate}
        disabled={loading || amount <= 0}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:scale-105 transition"
      >
        {loading ? 'Procesando...' : 'Comprar ahora'}
      </button>

      {/* 🔒 TRUST */}
      <p className="text-xs text-center text-gray-400">
        🔒 Pago seguro con MercadoPago
      </p>

    </div>
  )
}

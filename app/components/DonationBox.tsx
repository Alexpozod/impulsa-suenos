'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function DonationBox({
  campaign_id
}: {
  campaign_id: string
}) {

  const [amount, setAmount] = useState(5000)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const presets = [2000, 5000, 10000, 20000]

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data } = await supabase.auth.getSession()
    const email = data.session?.user?.email || null
    setUserEmail(email)
  }

  const donate = async () => {

    if (!amount || amount < 100) {
      alert("El monto mínimo es 100")
      return
    }

    if (!userEmail) {
      alert("Debes iniciar sesión para continuar")
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          campaign_id,
          user_email: userEmail
        })
      })

      const data = await res.json()

      if (data?.init_point) {
        window.location.href = data.init_point
      } else {
        console.error(data)
        alert("Error iniciando el pago")
      }

    } catch (error) {
      console.error(error)
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
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
            className={`py-2 rounded-lg border text-sm transition ${
              amount === p
                ? 'bg-green-600 text-white border-green-600'
                : 'hover:bg-gray-100'
            }`}
          >
            ${p.toLocaleString()}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border p-2 rounded-lg"
        placeholder="Ingresa monto"
      />

      {/* CTA */}
      <button
        onClick={donate}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition"
      >
        {loading ? "Procesando..." : "Donar ahora"}
      </button>

      {/* TRUST */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Pago seguro con MercadoPago</p>
        <p>📊 Registro transparente</p>
      </div>

    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DonationBox({ campaign_id }: { campaign_id: string }) {

  const [amount, setAmount] = useState(5000)
  const [tip, setTip] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const router = useRouter()
  const presets = [2000, 5000, 10000, 20000]

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data } = await supabase.auth.getSession()
    setUserEmail(data.session?.user?.email || null)
  }

  const total = amount + tip

  const donate = async () => {

    if (!amount || amount < 100) return

    if (!userEmail) {
      localStorage.setItem('donation_intent', JSON.stringify({
        campaign_id,
        amount,
        tip,
        message
      }))
      router.push(`/login?redirect=/campaign/${campaign_id}`)
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tip,
          campaign_id,
          user_email: userEmail,
          message
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error en el pago")
        return
      }

      if (data?.init_point) {
        window.location.href = data.init_point
      }

    } catch {
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-5">

      <h3 className="font-bold text-lg">💖 Apoya esta causa</h3>

      <div className="grid grid-cols-4 gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`py-2 rounded-lg border text-sm ${
              amount === p
                ? 'bg-green-600 text-white border-green-600'
                : 'hover:bg-gray-100'
            }`}
          >
            ${p.toLocaleString()}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border p-2 rounded-lg"
      />

      {/* 💬 MENSAJE */}
      <textarea
        placeholder="Escribe un mensaje de apoyo (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border p-2 rounded-lg text-sm"
        rows={3}
      />

      <div className="bg-gray-50 p-3 rounded-xl">
        <p className="text-sm font-semibold">💚 Apoya ImpulsaSueños</p>

        <div className="flex gap-2 mt-2">
          {[0, 500, 1000, 2000].map((t) => (
            <button
              key={t}
              onClick={() => setTip(t)}
              className={`px-3 py-1 rounded border text-sm ${
                tip === t
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            >
              {t === 0 ? "Sin tip" : `+$${t}`}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold text-green-600">
          ${total.toLocaleString()}
        </p>
      </div>

      <button
        onClick={donate}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
      >
        {loading ? "Procesando..." : "🚀 Donar"}
      </button>

    </div>
  )
}
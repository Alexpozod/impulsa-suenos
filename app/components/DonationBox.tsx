'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DonationBox({
  campaign_id
}: {
  campaign_id: string
}) {

  const [amount, setAmount] = useState(5000)
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

  const donate = async () => {

    if (!amount || amount < 100) return

    if (!userEmail) {
      localStorage.setItem('donation_intent', JSON.stringify({
        campaign_id,
        amount
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
          campaign_id,
          user_email: userEmail
        })
      })

      // 🔥 FIX CRÍTICO
      const text = await res.text()

      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("❌ RESPONSE NO ES JSON:", text)
        alert("Error del servidor (respuesta inválida)")
        return
      }

      if (!res.ok) {
        console.error("❌ ERROR API:", data)
        alert(data?.error || "Error en el pago")
        return
      }

      const url = data?.init_point || data?.url

      if (url) {
        window.location.href = url
      } else {
        console.error("❌ SIN URL:", data)
        alert("No se pudo iniciar el pago")
      }

    } catch (error) {
      console.error("❌ ERROR FETCH:", error)
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

      <button
        onClick={donate}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700"
      >
        {loading ? "Procesando..." : "Donar ahora"}
      </button>

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Pago seguro</p>
        <p>📊 Transparencia total</p>
      </div>

    </div>
  )
}
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
  const [tip, setTip] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 🔐 NUEVO
  const [acceptedLegal, setAcceptedLegal] = useState(false)

  const router = useRouter()
  const presets = [2000, 5000, 10000, 20000]

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      setUserEmail(data.session?.user?.email || null)
    } catch (err) {
      console.error("Error loading user:", err)
    }
  }

  const total = amount + tip

  const donate = async () => {

    console.log("CLICK DONAR")

    // 🚨 VALIDACIÓN LEGAL (CRÍTICA)
    if (!acceptedLegal) {
      alert("Debes aceptar los términos antes de continuar")
      return
    }

    if (!amount || amount < 100) {
      alert("Monto mínimo $100")
      return
    }

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

      // 🔐 LOG LEGAL (NO BLOQUEA UX)
      try {
        fetch("/api/legal-consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "donation_ack",
            accepted: true,
            version: "v1.0",
            email: userEmail
          })
        })
      } catch (err) {
        console.error("Consent error", err)
      }

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          tip,
          campaign_id,
          user_email: userEmail,
          message,
          provider: "mercadopago"
        })
      })

      const text = await res.text()

      console.log("RESPONSE RAW:", text)

      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch {
        alert("Error del servidor")
        return
      }

      if (!res.ok) {
        alert(data?.error || "Error en el pago")
        return
      }

      const url = data?.init_point || data?.url

      if (url) {
        window.location.href = url
      } else {
        console.error("NO URL:", data)
        alert("No se pudo iniciar el pago")
      }

    } catch (error) {

      console.error("ERROR FETCH:", error)
      alert("Error inesperado")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-5">

      <h3 className="font-bold text-lg">
        💖 Apoya esta causa
      </h3>

      <p className="text-xs text-orange-600 text-center font-semibold">
        ⚡ Cada aporte ayuda a lograr la meta más rápido
      </p>

      {/* PRESETS */}
      <div className="grid grid-cols-4 gap-2">
        {presets.map(p => (
          <button
            key={p}
            type="button"
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

      {/* INPUT */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border p-2 rounded-lg"
      />

      {/* MENSAJE */}
      <textarea
        placeholder="Deja un mensaje de apoyo (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border p-3 rounded-lg text-sm"
      />

      {/* TIP */}
      <div className="bg-gray-50 p-3 rounded-xl">
        <p className="text-sm font-semibold">
          💚 Apoya ImpulsaSueños (opcional)
        </p>

        <div className="flex gap-2 mt-2">
          {[0, 500, 1000, 2000].map((t) => (
            <button
              key={t}
              type="button"
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

      {/* TOTAL */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold text-green-600">
          ${total.toLocaleString()}
        </p>
      </div>

      {/* 🔐 CHECK LEGAL */}
      <label className="flex items-start gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(e) => setAcceptedLegal(e.target.checked)}
        />
        Acepto los{" "}
        <a href="/terminos" className="underline">Términos</a> y reconozco que los aportes no constituyen donaciones legales.
      </label>

      {/* BOTÓN */}
      <button
        onClick={donate}
        disabled={loading}
        type="button"
        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
      >
        {loading ? "Procesando..." : "🚀 Donar"}
      </button>

    </div>
  )
}
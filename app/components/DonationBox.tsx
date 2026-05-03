"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DonationBox({
  campaign_id,
  refParam
}: {
  campaign_id: string
  refParam?: string | null
}) {

  const [amount, setAmount] = useState(5000)
  const [tip, setTip] = useState(0)
  const [customTip, setCustomTip] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [acceptedLegal, setAcceptedLegal] = useState(false)

  const [donorName, setDonorName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  const router = useRouter()
  const presets = [2000, 5000, 10000, 20000]

  useEffect(() => {
    loadUser()

    /* =========================
       🔥 GUARDAR REF (CRÍTICO)
    ========================= */
    try {
      const params = new URLSearchParams(window.location.search)

      const refFromUrl = params.get("ref")
      const sourceFromUrl = params.get("source")

      if (refFromUrl) {
        localStorage.setItem("referrer", refFromUrl)
      }

      if (sourceFromUrl) {
        localStorage.setItem("traffic_source", sourceFromUrl)
      }
    } catch (err) {
      console.error("Ref save error:", err)
    }

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

    if (!acceptedLegal) {
      alert("Debes aceptar los términos antes de continuar")
      return
    }

    if (!amount || amount < 100) {
      alert("Monto mínimo $100")
      return
    }

    if (!userEmail) {

      /* =========================
         🔥 GUARDAR INTENTO + REF
      ========================= */
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

      let finalDonorName = "Donador"

      if (isAnonymous) {
        finalDonorName = "Anónimo"
      } else if (donorName && donorName.trim().length > 0) {
        finalDonorName = donorName.trim()
      } else if (userEmail && userEmail.includes("@")) {
        finalDonorName = userEmail.split("@")[0]
      }

      /* =========================
         🔥 TRACKING REAL (FIX FINAL)
      ========================= */

      const params = new URLSearchParams(window.location.search)

      const refFromUrl = params.get("ref")
      const sourceFromUrl = params.get("source")

      const refFromStorage = localStorage.getItem("referrer")
      const sourceFromStorage = localStorage.getItem("traffic_source")

      const finalRef =
        refParam ||
        refFromUrl ||
        refFromStorage ||
        null

      const finalSource =
        sourceFromUrl ||
        sourceFromStorage ||
        "direct"

      /* =========================
         🚀 REQUEST
      ========================= */

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
          donor_name: finalDonorName,
          provider: "mercadopago",

          // 🔥 TRACKING FINAL
          ref: finalRef,
          source: finalSource
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

      <div className="space-y-2">

        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          disabled={isAnonymous}
          className="w-full border p-2 rounded-lg text-sm"
        />

        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Donar de forma anónima
        </label>

      </div>

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

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border p-2 rounded-lg"
      />

      <textarea
        placeholder="Deja un mensaje de apoyo (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border p-3 rounded-lg text-sm"
      />

      <div className="bg-gray-50 p-3 rounded-xl">
        <p className="text-sm font-semibold">
          💚 Apoya ImpulsaSueños (opcional)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          💡 La mayoría apoya con $1,000
        </p>

        <div className="flex gap-2 mt-2">
          {[0, 500, 1000, 2000].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTip(t)
                setCustomTip("") // limpia input
              }}
              className={`px-3 py-1 rounded border text-sm ${
                customTip
                  ? "border-gray-300 opacity-50"
                  : tip === t
                  ? "border-green-500 bg-green-50"
                  : t === 2000
                  ? "border-green-300 bg-green-50 font-semibold"
                  : "border-gray-300"
              }`}
            >
              {t === 0 ? "Sin tip" : t === 2000 ? `🔥 +$${t}` : `+$${t}`}
            </button>
          ))}
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            ❤️ Puedes apoyar con cualquier monto adicional
          </p>
          <input
            type="number"
            placeholder="Otro monto (mín. $1,500)"
            value={customTip}
            className={`w-full mt-2 p-2 border rounded-lg text-sm ${
              customTip ? "border-green-500 ring-1 ring-green-200" : ""
            }`}
            onChange={(e) => {
              const value = e.target.value
              setCustomTip(value)

              const num = Number(value)

              if (!num) {
                setTip(0)
                return
              }

              if (num < 1500) {
                setTip(1500)
              } else {
                setTip(num)
              }
            }}
          />

          </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold text-green-600">
          ${total.toLocaleString()}
        </p>
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(e) => setAcceptedLegal(e.target.checked)}
        />
        Acepto los{" "}
        <a href="/terminos" className="underline">Términos</a> y reconozco que los aportes no constituyen donaciones legales.
      </label>

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
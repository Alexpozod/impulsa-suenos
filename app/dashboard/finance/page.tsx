'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { formatMoney } from "@/src/lib/formatMoney"

export default function FinancePage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const [otp, setOtp] = useState("")
  const [otpValid, setOtpValid] = useState(false)
  const [validatingOtp, setValidatingOtp] = useState(false)

  const [cooldown, setCooldown] = useState(0)

  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(p => p - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/user/finance", {
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    })

    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  const selected = data?.campaigns?.find(
    (c: any) => c.id === selectedCampaign
  )

  const maxAmount = Number(selected?.available || 0)
  const numericAmount = Number(amount)

  const invalidAmount =
    !numericAmount || numericAmount <= 0 || numericAmount > maxAmount

  const canWithdraw =
  selected &&
  !invalidAmount &&
  otpValid

  /* =========================
     OTP SEND
  ========================= */
  const sendOtp = async () => {
    if (cooldown > 0) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: userData } = await supabase.auth.getUser()

      if (!session?.access_token || !userData?.user?.email) {
        setMessage("❌ Error de sesión")
        return
      }

      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: userData.user.email
        })
      })

      const json = await res.json()

      if (json.error) {
        setMessage(`❌ ${json.error}`)
        return
      }

      setCooldown(60)
      setMessage("📩 Código enviado")

    } catch {
      setMessage("❌ Error enviando OTP")
    }
  }

  /* =========================
     OTP VERIFY
  ========================= */
  const validateOtp = async () => {
    if (otp.length !== 6) {
      setMessage("❌ Código incompleto")
      return
    }

    try {
      setValidatingOtp(true)

      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          code: otp
        })
      })

      const json = await res.json()

      if (json.error) {
        setOtpValid(false)
        setMessage("❌ Código inválido")
      } else {
        setOtpValid(true)
        setMessage("✅ Código verificado")
      }

    } catch {
      setMessage("❌ Error validando código")
    } finally {
      setValidatingOtp(false)
    }
  }

  /* =========================
     REQUEST PAYOUT
  ========================= */
  const requestPayout = async () => {
    setMessage("")

    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/payout/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        campaign_id: selectedCampaign,
        amount: numericAmount,
        otp_code: otp
      })
    })

    const json = await res.json()

    if (json.error) {
      setMessage(`❌ ${json.error}`)
    } else {
      setMessage(`✅ Retiro solicitado correctamente`)
      setAmount("")
      setOtp("")
      setOtpValid(false)
      setShowConfirm(false)
      load()
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>

  const totalIn = data?.totals?.raised || 0
  const totalOut = data?.totals?.withdrawn || 0
  const total = totalIn + totalOut || 1

  const inPercent = (totalIn / total) * 100
  const outPercent = (totalOut / total) * 100

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">💰 Tu dinero</h1>

      {/* BALANCE */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Disponible" value={data?.totals?.balance} />
        <Card title="En revisión" value={data?.totals?.pending} />
        <Card title="Total generado" value={data?.totals?.raised} />
      </div>

      {/* GRAFICO */}
      <div className="bg-white p-5 rounded-xl border">
        <h2 className="font-semibold mb-3">Ingresos vs Retiros</h2>

        <div className="w-full h-4 bg-gray-200 rounded-full flex overflow-hidden">
          <div className="bg-primary" style={{ width: `${inPercent}%` }} />
          <div className="bg-red-100" style={{ width: `${outPercent}%` }} />
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-primary">Ingresos: ${totalIn}</span>
          <span className="text-red-600">Retiros: ${totalOut}</span>
        </div>
      </div>

      {/* BREAKDOWN */}
      <div className="bg-white p-5 rounded-xl border">
        <h2 className="font-semibold mb-3">Breakdown por campaña</h2>

        {data?.campaigns?.map((c: any) => (
          <div key={c.id} className="flex justify-between text-sm py-2 border-b">
            <span>{c.title}</span>
            <span>{formatMoney(c.available)}</span>
          </div>
        ))}
      </div>

      {/* RETIRO */}
      <div className="bg-white p-5 rounded-xl border space-y-4">

        <h2 className="font-semibold">Solicitar retiro</h2>

        <select
          value={selectedCampaign || ""}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">Selecciona campaña</option>
          {data?.campaigns?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.title} — {formatMoney(c.available)}
            </option>
          ))}
        </select>

        {selected && (
          <p className="text-sm text-gray-600">
            Máximo: <b>{formatMoney(maxAmount)}</b>
          </p>
        )}

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* OTP */}
        <div className="flex gap-2">
          <button
            onClick={sendOtp}
            disabled={cooldown > 0}
            className={`px-3 py-2 rounded text-sm ${
              cooldown > 0 ? "bg-gray-200 text-gray-500" : "bg-primary text-white"
            }`}
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Enviar código"}
          </button>

          <input
            type="text"
            placeholder="Código OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value)
              setOtpValid(false)
            }}
            className="flex-1 border p-2 rounded"
          />

          <button
            onClick={validateOtp}
            disabled={otp.length !== 6 || validatingOtp}
            className={`px-3 py-2 rounded text-sm ${
              otp.length === 6
                ? "bg-primary text-white"
                : "bg-gray-300"
            }`}
          >
            {validatingOtp ? "Validando..." : "Validar"}
          </button>
        </div>

        {/* BOTON */}
        <button
          disabled={!canWithdraw}
          onClick={requestPayout}
          className={`px-4 py-2 rounded text-white ${
            canWithdraw
              ? "bg-primary hover:bg-primaryHover"
              : "bg-gray-300"
          }`}
        >
          Solicitar retiro
        </button>

        {message && <p className="text-sm">{message}</p>}
      </div>

      {/* HISTORIAL */}
      <div className="bg-white p-5 rounded-xl border">

        <h2 className="font-semibold mb-3">Historial</h2>

        {data?.movements?.map((m: any, i: number) => (
          <div key={i} className="flex justify-between text-sm border-b py-2">

            <span>
              {m.type === "donation" && "💚 Donación"}
              {m.type === "withdraw" &&
  (
    m.status === "pending"
      ? "⏳ Retiro en revisión"
      : m.status === "rejected"
      ? "❌ Retiro rechazado"
      : "💸 Retiro aprobado"
  )}
            </span>

            <span
              className={
                m.type === "donation"
                  ? "text-primary"
                  : "text-red-500"
              }
            >
              {m.type === "donation" ? "+" : "-"}$
              {formatMoney(Math.abs(Number(m.amount)))}
            </span>

          </div>
        ))}

      </div>

    </main>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {formatMoney(value)}
      </p>
    </div>
  )
}
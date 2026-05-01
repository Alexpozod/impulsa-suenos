'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function FinancePage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

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
    data?.kyc_status === "approved" &&
    data?.has_bank &&
    otp.length === 6

  /* =========================
     📩 ENVIAR OTP
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

      setOtpSent(true)
      setCooldown(60)
      setMessage("📩 Código enviado")

    } catch {
      setMessage("❌ Error enviando OTP")
    }
  }

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
      setOtpSent(false)
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

      {/* GRÁFICO */}
      <div className="bg-white p-5 rounded-xl border">
        <h2 className="font-semibold mb-3">Ingresos vs Retiros</h2>

        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div className="bg-green-500" style={{ width: `${inPercent}%` }} />
          <div className="bg-red-500" style={{ width: `${outPercent}%` }} />
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-green-600">Ingresos: ${totalIn}</span>
          <span className="text-red-500">Retiros: ${totalOut}</span>
        </div>
      </div>

      {/* CAMPAÑAS */}
      <div className="bg-white p-5 rounded-xl border">
        <h2 className="font-semibold mb-3">Breakdown por campaña</h2>

        {data?.campaigns?.map((c: any) => (
          <div key={c.id} className="flex justify-between text-sm py-2 border-b">
            <span>{c.title}</span>
            <span>${Number(c.available || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* RETIRO */}
      <div className="bg-white p-5 rounded-xl border space-y-4">

        <h2 className="font-semibold">Solicitar retiro</h2>

        <select
          value={selectedCampaign || ""}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona campaña</option>
          {data?.campaigns?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.title} — ${Number(c.available || 0).toLocaleString()}
            </option>
          ))}
        </select>

        {selected && (
          <p className="text-sm text-gray-600">
            Máximo: <b>${maxAmount.toLocaleString()}</b>
          </p>
        )}

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {numericAmount > maxAmount && (
          <p className="text-sm text-red-500">
            ❌ Supera el saldo disponible
          </p>
        )}

        {/* OTP */}
        <div className="flex gap-2">
          <button
            onClick={sendOtp}
            disabled={cooldown > 0}
            className={`px-3 py-2 rounded text-sm ${
              cooldown > 0 ? "bg-gray-300" : "bg-blue-600 text-white"
            }`}
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Enviar código"}
          </button>

          <input
            type="text"
            placeholder="Código OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
        </div>

        {/* FEEDBACK OTP */}
        {otp.length > 0 && otp.length < 6 && (
          <p className="text-sm text-yellow-600">Código incompleto</p>
        )}

        {otp.length === 6 && (
          <p className="text-sm text-green-600">
            Código listo para validar
          </p>
        )}

        {/* BOTÓN */}
        <button
          disabled={!canWithdraw}
          onClick={() => setShowConfirm(true)}
          className={`px-4 py-2 rounded text-white ${
            canWithdraw
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300"
          }`}
        >
          {canWithdraw ? "Confirmar retiro" : "Completa los datos"}
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
                (m.status === "pending"
                  ? "⏳ Retiro en revisión"
                  : "💸 Retiro aprobado")}
            </span>

            <span
              className={
                m.type === "donation"
                  ? "text-green-600"
                  : "text-red-500"
              }
            >
              {m.type === "donation" ? "+" : "-"}$
              {Math.abs(Number(m.amount)).toLocaleString()}
            </span>

          </div>
        ))}

      </div>

    </main>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
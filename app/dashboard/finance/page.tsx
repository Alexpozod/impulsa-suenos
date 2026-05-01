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

  /* =========================
     ⏳ COOLDOWN TIMER
  ========================= */
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)

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
    !numericAmount ||
    numericAmount <= 0 ||
    numericAmount > maxAmount

  const canWithdraw =
    selected &&
    !invalidAmount &&
    data?.kyc_status === "approved" &&
    data?.has_bank &&
    otpSent

  /* =========================
     📩 ENVIAR OTP
  ========================= */
  const sendOtp = async () => {
    if (cooldown > 0) return

    const { data: { session } } = await supabase.auth.getSession()

    await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    })

    setOtpSent(true)
    setCooldown(60) // 🔥 60 segundos anti spam
  }

  /* =========================
     💸 SOLICITAR RETIRO
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
      setOtpSent(false)
      setShowConfirm(false)
      load()
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">💰 Tu dinero</h1>

      {/* BALANCE */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Disponible" value={data.available} />
        <Card title="En revisión" value={data.pending} />
        <Card title="Total generado" value={data.balance} />
      </div>

      {/* RETIRO */}
      <div className="bg-white p-5 rounded-xl border space-y-4">

        <h2 className="font-semibold">Solicitar retiro</h2>

        {/* CAMPAÑAS */}
        <select
          value={selectedCampaign || ""}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona campaña</option>

          {data?.campaigns?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.title} — Disponible: $
              {Number(c.available || 0).toLocaleString()}
            </option>
          ))}
        </select>

        {/* INFO */}
        {selected && (
          <p className="text-sm text-gray-600">
            Máximo: <b>${maxAmount.toLocaleString()}</b>
          </p>
        )}

        {/* WARNINGS */}
        {data?.kyc_status !== "approved" && (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Debes completar KYC
          </div>
        )}

        {!data?.has_bank && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            ℹ️ Agrega cuenta bancaria
          </div>
        )}

        {/* MONTO */}
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
              cooldown > 0
                ? "bg-gray-300"
                : "bg-blue-600 text-white"
            }`}
          >
            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : "Enviar código"}
          </button>

          <input
            type="text"
            placeholder="Código OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="flex-1 border p-2 rounded"
          />

        </div>

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
          Solicitar retiro
        </button>

        {message && <p className="text-sm">{message}</p>}
      </div>

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">

            <h3 className="font-semibold">Confirmar retiro</h3>

            <p className="text-sm">
              Retirarás <b>${numericAmount.toLocaleString()}</b>
            </p>

            <div className="flex gap-2">

              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={requestPayout}
                className="flex-1 bg-green-600 text-white p-2 rounded"
              >
                Confirmar
              </button>

            </div>

          </div>

        </div>
      )}

      {/* HISTORIAL */}
      <div className="bg-white p-5 rounded-xl border">

        <h2 className="font-semibold mb-3">Historial</h2>

        {data.movements.map((m: any, i: number) => (
          <div key={i} className="flex justify-between text-sm border-b py-2">
            <span>
              {m.type === "payment" ? "💚 Donación" : "💸 Retiro"}
            </span>
            <span className={m.amount > 0 ? "text-green-600" : "text-red-500"}>
              {m.amount > 0 ? "+" : "-"}$
              {Math.abs(m.amount).toLocaleString()}
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
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PayoutAdmin() {

  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/admin/payouts", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setPayouts(data || [])
    } catch (err) {
      setError("Error cargando payouts")
    }

    setLoading(false)
  }

  const approve = async (id: string) => {

    const confirmAction = confirm("¿Seguro que quieres aprobar este pago?")
    if (!confirmAction) return

    try {
      setProcessing(id)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/payout/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payout_id: id })
      })

      const json = await res.json()

      if (json.error) {
        alert(`❌ ${json.error}`)
      } else {
        alert("✅ Pago aprobado correctamente")
        load()
      }

    } catch {
      alert("❌ Error procesando payout")
    }

    setProcessing(null)
  }

  const reject = async (id: string) => {

    const confirmAction = confirm("¿Rechazar este retiro?")
    if (!confirmAction) return

    try {
      setProcessing(id)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/payout/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payout_id: id })
      })

      const json = await res.json()

      if (json.error) {
        alert(`❌ ${json.error}`)
      } else {
        alert("❌ Retiro rechazado")
        load()
      }

    } catch {
      alert("Error rechazando payout")
    }

    setProcessing(null)
  }

  /* =========================
     📊 KPIs
  ========================= */
  const totalPending = payouts
    .filter(p => p.status === "pending")
    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

  const totalPaid = payouts
    .filter(p => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

  if (loading) {
    return <div className="p-6">Cargando payouts...</div>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">
          💸 Panel de Retiros
        </h1>

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* KPIs */}
        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
            <p className="text-sm text-yellow-400">Pendiente</p>
            <p className="text-xl font-bold text-white">
              ${totalPending.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
            <p className="text-sm text-green-400">Pagado</p>
            <p className="text-xl font-bold text-white">
              ${totalPaid.toLocaleString()}
            </p>
          </div>

        </div>

        {/* LISTA */}
        <div className="space-y-4">

          {payouts.length === 0 && (
            <p className="text-slate-400">No hay payouts</p>
          )}

          {payouts.map((p) => {

            const isPending = p.status === "pending"

            // 🔥 FIX REAL
            const available = Number(p.available || 0)
            const isInvalid = p.amount > available

            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center">

                  <div>
                    <p className="font-bold text-lg text-white">
                      {p.campaign_title || p.campaign_id}
                    </p>

                    <p className="text-sm text-slate-400">
                      {p.owner || p.user_email || "Sin info"}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${p.status === "pending" && "bg-yellow-500/20 text-yellow-400"}
                    ${p.status === "paid" && "bg-green-500/20 text-green-400"}
                    ${p.status === "rejected" && "bg-red-500/20 text-red-400"}
                  `}>
                    {p.status}
                  </span>

                </div>

                {/* INFO */}
                <div className="text-sm space-y-1 text-slate-300">

                  <p>💰 Monto: <strong>${Number(p.amount).toLocaleString()}</strong></p>

                  <p>📊 Balance: ${Number(p.balance || 0).toLocaleString()}</p>

                  <p>🔒 Retenido: ${Number(p.pending || 0).toLocaleString()}</p>

                  <p>✅ Disponible: ${available.toLocaleString()}</p>

                  <p className="text-slate-500">
                    🕒 {new Date(p.created_at).toLocaleString()}
                  </p>

                </div>

                {/* WARNING CORRECTO */}
                {isInvalid && (
                  <p className="text-yellow-400 text-sm font-medium">
                    ⚠️ Excede saldo disponible
                  </p>
                )}

                {/* ACCIONES */}
                {isPending && (
                  <div className="flex gap-3 pt-2">

                    <button
                      onClick={() => approve(p.id)}
                      disabled={processing === p.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing === p.id ? "Procesando..." : "Aprobar"}
                    </button>

                    <button
                      onClick={() => reject(p.id)}
                      disabled={processing === p.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Rechazar
                    </button>

                  </div>
                )}

              </div>
            )
          })}

        </div>

      </div>

    </main>
  )
}
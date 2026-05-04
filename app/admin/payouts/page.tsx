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
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/admin/payouts", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      // 🔥 FIX CRÍTICO (NO MÁS CRASH)
      if (!res.ok) {
        setError(data.error || "Error API")
        setPayouts([])
        setLoading(false)
        return
      }

      if (!Array.isArray(data)) {
        setPayouts([])
        setLoading(false)
        return
      }

      setPayouts(data)

    } catch (err) {
      console.error(err)
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
    return <div className="p-6 text-white">Cargando payouts...</div>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 space-y-6">

      <h1 className="text-3xl font-bold">
        💸 Panel de Retiros
      </h1>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {/* KPIs */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-yellow-500/20 border border-yellow-500/30 p-5 rounded-2xl">
          <p className="text-sm text-yellow-300">Pendiente</p>
          <p className="text-2xl font-bold">
            ${totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-primarySoft border border-primary/30 p-5 rounded-2xl">
          <p className="text-sm text-secondaryDark">Pagado</p>
          <p className="text-2xl font-bold">
            ${totalPaid.toLocaleString()}
          </p>
        </div>

      </div>

      {/* LISTA */}
      <div className="space-y-5">

        {payouts.length === 0 && (
          <p className="text-slate-400">No hay payouts</p>
        )}

        {payouts.map((p) => {

          const isPending = p.status === "pending"

          return (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center">

                <div>
                  <p className="font-semibold text-lg">
                    {p.campaign_title || p.campaign_id}
                  </p>

                  <p className="text-sm text-slate-400">
                    {p.owner}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium
                 ${p.status === "pending" && "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"}
                  ${p.status === "paid" && "bg-secondarySoft text-secondaryDark"}
                  ${p.status === "rejected" && "bg-red-500/20 border border-red-500/30 text-red-300"}
                `}>
                  {p.status}
                </span>

              </div>

              {/* INFO */}
              <div className="mt-3 text-sm space-y-1">

                <p>💰 ${Number(p.amount).toLocaleString()}</p>

                <p className="text-slate-400">
                  🕒 {new Date(p.created_at).toLocaleString()}
                </p>

              </div>

              {/* 🔥 ALERTA ELIMINADA (ERA INCORRECTA) */}

              {/* ACCIONES */}
              {isPending && (
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() => approve(p.id)}
                    disabled={processing === p.id}
                    className="bg-primary px-4 py-2 rounded-lg hover:bg-primaryHover"
                  >
                    {processing === p.id ? "Procesando..." : "Aprobar"}
                  </button>

                  <button
                    onClick={() => reject(p.id)}
                    disabled={processing === p.id}
                    className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30"
                  >
                    Rechazar
                  </button>

                </div>
              )}

            </div>
          )
        })}

      </div>

    </main>
  )
}
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

      const res = await fetch("/api/payout/list", {
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

  /* =========================
     ❌ RECHAZAR (NUEVO PRO)
  ========================= */
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
     📊 KPIs PRO
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
    <main className="p-6 max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        🏦 Panel de Retiros
      </h1>

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {/* =========================
          KPIs
      ========================= */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-yellow-100 p-4 rounded">
          <p className="text-sm text-gray-600">Pendiente</p>
          <p className="text-xl font-bold">
            ${totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-600">Pagado</p>
          <p className="text-xl font-bold">
            ${totalPaid.toLocaleString()}
          </p>
        </div>

      </div>

      {/* =========================
          LISTA
      ========================= */}
      <div className="space-y-4">

        {payouts.length === 0 && (
          <p className="text-gray-500">No hay payouts</p>
        )}

        {payouts.map((p) => {

          const isPending = p.status === "pending"

          return (
            <div
              key={p.id}
              className="bg-white border rounded-xl p-5 shadow-sm space-y-3"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center">

                <div>
                  <p className="font-bold text-lg">
                    {p.campaign_title || p.campaign_id}
                  </p>

                  <p className="text-sm text-gray-500">
                    {p.owner || p.user_email || "Sin info"}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded text-sm font-medium
                  ${p.status === "pending" && "bg-yellow-100 text-yellow-700"}
                  ${p.status === "paid" && "bg-green-100 text-green-700"}
                  ${p.status === "rejected" && "bg-red-100 text-red-700"}
                `}>
                  {p.status}
                </span>

              </div>

              {/* INFO */}
              <div className="text-sm space-y-1">

                <p>💰 Monto solicitado: <strong>${Number(p.amount).toLocaleString()}</strong></p>

                {p.balance !== undefined && (
                  <p>📊 Balance campaña: ${Number(p.balance).toLocaleString()}</p>
                )}

                <p className="text-gray-500">
                  🕒 {new Date(p.created_at).toLocaleString()}
                </p>

              </div>

              {/* ALERTA */}
              {p.balance !== undefined && p.amount > p.balance && (
                <p className="text-red-600 text-sm font-medium">
                  ⚠️ Este payout supera el balance disponible
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

    </main>
  )
}
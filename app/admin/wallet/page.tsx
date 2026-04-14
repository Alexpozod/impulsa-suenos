'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Wallet = {
  user_email: string
  available: number
  pending: number
  total: number
}

export default function WalletAdminPage() {

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const { data: ledger, error } = await supabase
        .from("financial_ledger")
        .select("user_email, amount, flow_type, status")

      if (error) {
        console.error("Ledger error:", error)
        return
      }

      const map: Record<string, Wallet> = {}

      ledger?.forEach((l: any) => {

        if (!l.user_email) return

        if (!map[l.user_email]) {
          map[l.user_email] = {
            user_email: l.user_email,
            available: 0,
            pending: 0,
            total: 0
          }
        }

        const amount = Number(l.amount || 0)

        // 🔒 SOLO CONFIRMED → DISPONIBLE
        if (l.status === "confirmed") {
          if (l.flow_type === "in") {
            map[l.user_email].available += amount
          }
          if (l.flow_type === "out") {
            map[l.user_email].available -= Math.abs(amount)
          }
        }

        // ⏳ PENDING → NO DISPONIBLE
        if (l.status === "pending") {
          if (l.flow_type === "in") {
            map[l.user_email].pending += amount
          }
        }

        // 🧮 TOTAL
        map[l.user_email].total =
          map[l.user_email].available + map[l.user_email].pending

      })

      const result = Object.values(map).sort(
        (a, b) => b.total - a.total
      )

      setWallets(result)

    } catch (err) {
      console.error("Wallet load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalAvailable = wallets.reduce(
    (acc, w) => acc + w.available,
    0
  )

  const totalPending = wallets.reduce(
    (acc, w) => acc + w.pending,
    0
  )

  const totalPlatform = wallets.reduce(
    (acc, w) => acc + w.total,
    0
  )

  if (loading) {
    return <div className="p-10 text-white">Cargando wallets...</div>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          👛 Wallets (Real)
        </h1>

        {/* =========================
            RESUMEN GLOBAL
        ========================= */}
        <div className="grid md:grid-cols-3 gap-4">

          <Card title="Disponible" value={totalAvailable} color="green" />
          <Card title="Pendiente" value={totalPending} color="yellow" />
          <Card title="Total plataforma" value={totalPlatform} color="blue" />

        </div>

        {/* =========================
            LISTADO
        ========================= */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

          <div className="grid grid-cols-4 text-sm font-semibold mb-3 text-slate-400">
            <span>Email</span>
            <span className="text-center">Disponible</span>
            <span className="text-center">Pendiente</span>
            <span className="text-right">Total</span>
          </div>

          {wallets.length === 0 && (
            <p className="text-sm text-slate-400">
              No hay movimientos financieros aún
            </p>
          )}

          {wallets.map((w, i) => (
            <div
              key={i}
              className="grid grid-cols-4 border-b border-slate-800 py-2 text-sm"
            >
              <span className="truncate">{w.user_email}</span>

              <span className="text-green-400 text-center">
                ${w.available.toLocaleString()}
              </span>

              <span className="text-yellow-400 text-center">
                ${w.pending.toLocaleString()}
              </span>

              <span className="text-blue-400 text-right">
                ${w.total.toLocaleString()}
              </span>
            </div>
          ))}

        </div>

      </div>

    </main>
  )
}

/* =========================
   COMPONENTE
========================= */

function Card({ title, value, color }: any) {

  const colors: any = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400"
  }

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
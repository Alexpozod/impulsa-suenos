'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Wallet = {
  user_email: string
  balance: number
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
        .select("user_email, amount, status")

      if (error) {
        console.error("Ledger error:", error)
        return
      }

      const map: Record<string, Wallet> = {}

      ledger?.forEach((l: any) => {

        if (!l.user_email) return
        if (l.status !== "confirmed") return

        if (!map[l.user_email]) {
          map[l.user_email] = {
            user_email: l.user_email,
            balance: 0
          }
        }

        // 🔥 CLAVE: amount ya viene con signo correcto
        map[l.user_email].balance += Number(l.amount || 0)

      })

      const result = Object.values(map).sort(
        (a, b) => b.balance - a.balance
      )

      setWallets(result)

    } catch (err) {
      console.error("Wallet load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = wallets.reduce(
    (acc, w) => acc + Number(w.balance || 0),
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
            RESUMEN
        ========================= */}
        <div className="grid md:grid-cols-1 gap-4">
          <Card title="Balance total plataforma" value={totalBalance} />
        </div>

        {/* =========================
            LISTADO
        ========================= */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

          <div className="flex justify-between text-sm text-slate-400 mb-3">
            <span>Email</span>
            <span>Balance</span>
          </div>

          {wallets.length === 0 && (
            <p className="text-sm text-slate-400">
              No hay movimientos financieros
            </p>
          )}

          {wallets.map((w, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-slate-800 py-2 text-sm"
            >
              <span className="truncate">{w.user_email}</span>

              <span className="text-green-400">
                ${Number(w.balance).toLocaleString()}
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

function Card({ title, value }: any) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-xl font-bold text-blue-400">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
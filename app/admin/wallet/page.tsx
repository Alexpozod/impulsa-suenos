'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Wallet = {
  user_email: string
  available_balance: number
  pending_balance: number
}

export default function WalletAdminPage() {

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const { data, error } = await supabase
        .from("wallets")
        .select("user_email, available_balance, pending_balance")
        .order("available_balance", { ascending: false })

      if (error) {
        console.error("Wallet error:", error)
        return
      }

      setWallets(data || [])

    } catch (err) {
      console.error("Wallet load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalAvailable = wallets.reduce(
    (acc, w) => acc + Number(w.available_balance || 0),
    0
  )

  const totalPending = wallets.reduce(
    (acc, w) => acc + Number(w.pending_balance || 0),
    0
  )

  if (loading) {
    return <div className="p-10 text-white">Cargando wallets...</div>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          👛 Wallets
        </h1>

        {/* =========================
            RESUMEN GLOBAL
        ========================= */}
        <div className="grid md:grid-cols-2 gap-4">

          <Card title="Total disponible" value={totalAvailable} />
          <Card title="Total pendiente" value={totalPending} />

        </div>

        {/* =========================
            LISTADO
        ========================= */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

          <h2 className="font-semibold mb-4">
            Usuarios
          </h2>

          {wallets.length === 0 && (
            <p className="text-sm text-slate-400">
              No hay wallets registradas
            </p>
          )}

          {wallets.map((w, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-slate-800 py-2 text-sm"
            >
              <span className="w-1/3 truncate">
                {w.user_email}
              </span>

              <span className="text-green-400 w-1/3 text-center">
                ${Number(w.available_balance).toLocaleString()}
              </span>

              <span className="text-yellow-400 w-1/3 text-right">
                ${Number(w.pending_balance).toLocaleString()}
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
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
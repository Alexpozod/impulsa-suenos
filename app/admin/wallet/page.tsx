'use client'

import { useEffect, useState } from "react"

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

      const res = await fetch('/api/admin/wallet')
      const json = await res.json()

      setWallets(json.wallets || [])

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
    return (
      <div className="p-10 text-white">
        Cargando wallets...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          👛 Wallets (Admin)
        </h1>

        {/* =========================
            RESUMEN
        ========================= */}
        <div className="grid md:grid-cols-1 gap-4">
          <Card
            title="Balance total plataforma"
            value={totalBalance}
          />
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
              No hay wallets
            </p>
          )}

          {wallets.map((w, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-slate-800 py-2 text-sm"
            >
              <span className="truncate">
                {w.user_email}
              </span>

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
      <p className="text-sm text-slate-400">
        {title}
      </p>
      <p className="text-xl font-bold text-blue-400">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
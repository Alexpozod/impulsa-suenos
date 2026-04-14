'use client'

import { useEffect, useState } from "react"

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

      // ⚠️ TEMP: usamos endpoint existente
      const res = await fetch('/api/admin/users')
      const users = await res.json()

      const formatted = (users || []).map((u: any) => ({
        user_email: u.email,
        available_balance: u.wallet?.available_balance || 0,
        pending_balance: u.wallet?.pending_balance || 0
      }))

      setWallets(formatted)

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

        {/* RESUMEN */}
        <div className="grid md:grid-cols-2 gap-4">

          <Card title="Disponible" value={totalAvailable} />
          <Card title="Pendiente" value={totalPending} />

        </div>

        {/* LISTADO */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

          <h2 className="font-semibold mb-4">
            Usuarios
          </h2>

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
              <span>{w.user_email}</span>

              <span className="text-green-400">
                ${Number(w.available_balance).toLocaleString()}
              </span>

              <span className="text-yellow-400">
                ${Number(w.pending_balance).toLocaleString()}
              </span>
            </div>
          ))}

        </div>

      </div>

    </main>
  )
}

/* COMPONENTE */

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
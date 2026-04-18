'use client'

import { useEffect, useState } from "react"

export default function WalletAdminPage() {

  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 NUEVO
  const [distribution, setDistribution] = useState<any>({})
  const [walletUsers, setWalletUsers] = useState<any[]>([])
  const [walletIssues, setWalletIssues] = useState<any[]>([])

  useEffect(() => {
    loadWallets()
    loadDistribution()
    loadWalletUsers()
  }, [])

  const loadWallets = async () => {
    try {
      const res = await fetch("/api/admin/wallets")
      const data = await res.json()

      // 🔥 FIX CRÍTICO (NO ROMPE NADA)
      if (Array.isArray(data)) {
        setWallets(data)
      } else if (Array.isArray(data?.wallets)) {
        setWallets(data.wallets)
      } else {
        setWallets([])
      }

    } catch (e) {
      console.error(e)
      setWallets([])
    } finally {
      setLoading(false)
    }
  }

  const loadDistribution = async () => {
    try {
      const res = await fetch("/api/admin/wallets/distribution")
      const data = await res.json()

      // 🔥 DEFENSIVO
      setDistribution(data || {})

    } catch (e) {
      console.error(e)
      setDistribution({})
    }
  }

  const loadWalletUsers = async () => {
    try {
      const res = await fetch("/api/admin/wallets/users")
      const data = await res.json()

      // 🔥 DEFENSIVO
      setWalletUsers(Array.isArray(data?.users) ? data.users : [])
      setWalletIssues(Array.isArray(data?.issues) ? data.issues : [])

    } catch (e) {
      console.error(e)
      setWalletUsers([])
      setWalletIssues([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
        Cargando wallets...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-gray-100 p-6">

      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">
          🧠 Wallets (Admin)
        </h1>

        {/* =========================
           🔥 DISTRIBUCIÓN
        ========================= */}
        <div className="grid md:grid-cols-3 gap-4">

          <Card title="Fondos en campañas" value={distribution?.campaignFunds} />
          <Card title="Fondos plataforma" value={distribution?.platformFunds} />
          <Card title="Retiros pendientes" value={distribution?.pendingWithdrawals} />

        </div>

        {/* =========================
           📊 LISTADO ORIGINAL
        ========================= */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

          <p className="text-gray-400 text-sm mb-4">
            Wallets del sistema
          </p>

          {(Array.isArray(wallets) ? wallets : []).map((w, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-slate-800 py-2 text-sm"
            >
              <span>{w.user_email || "Platform"}</span>

              <span className={
                Number(w.balance) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }>
                ${Number(w.balance || 0).toLocaleString()}
              </span>
            </div>
          ))}

        </div>

        {/* =========================
           👤 AUDITORÍA
        ========================= */}
        <Section title="👤 Wallets (auditoría real)">

          {walletUsers.length === 0 && (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}

          {walletUsers.map((u, i) => (
            <Row key={i}>

              <span className="text-blue-400">
                {u.user_email}
              </span>

              <span className="text-gray-300">
                Wallet: ${Number(u.wallet_balance || 0).toLocaleString()}
              </span>

              <span className="text-gray-400">
                Ledger: ${Number(u.ledger_balance || 0).toLocaleString()}
              </span>

              <span className={
                u.status === "ok"
                  ? "text-green-400"
                  : u.status === "mismatch"
                  ? "text-yellow-400"
                  : "text-red-500"
              }>
                {u.status}
              </span>

            </Row>
          ))}

        </Section>

        {/* =========================
           🚨 ALERTAS
        ========================= */}
        {walletIssues.length > 0 && (
          <Section title="🚨 Inconsistencias detectadas">

            {walletIssues.map((u, i) => (
              <Row key={i}>

                <span className="text-red-400">
                  {u.user_email}
                </span>

                <span className="text-yellow-400">
                  Diff: ${Number(u.difference || 0).toLocaleString()}
                </span>

              </Row>
            ))}

          </Section>
        )}

      </div>

    </main>
  )
}

/* COMPONENTES */

function Card({ title, value }: any) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold text-green-400">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
      <h2 className="font-semibold text-gray-200">{title}</h2>
      {children}
    </div>
  )
}

function Row({ children }: any) {
  return (
    <div className="flex justify-between text-sm border-b border-slate-800 py-2">
      {children}
    </div>
  )
}
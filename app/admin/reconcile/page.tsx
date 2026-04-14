'use client'

import { useEffect, useState } from "react"

export default function ReconcilePage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch("/api/admin/reconcile")
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Error loading reconcile:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        Analizando sistema...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">
          🧠 Conciliación PRO
        </h1>

        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <p>Total issues: {data?.issues_found || 0}</p>
        </div>

        {data?.issues_found === 0 && (
          <p className="text-green-400">
            ✔ Todo está conciliado correctamente
          </p>
        )}

        {data?.issues?.map((i: any, idx: number) => (
          <div
            key={idx}
            className="bg-red-900/30 p-4 rounded border border-red-500"
          >

            {i.user_email && (
              <>
                <p className="font-bold">{i.user_email}</p>
                <p>Ledger: ${Number(i.ledger_balance || 0).toLocaleString()}</p>
                <p>Wallet: ${Number(i.wallet_balance || 0).toLocaleString()}</p>
                <p className="text-red-400">
                  Diferencia: ${Number(i.diff || 0).toLocaleString()}
                </p>
              </>
            )}

            {i.payment_id && (
              <p>⚠️ Payment issue: {i.payment_id}</p>
            )}

            {i.payout_id && (
              <p>⚠️ Payout issue: {i.payout_id}</p>
            )}

          </div>
        ))}

      </div>

    </main>
  )
}
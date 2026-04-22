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

  /* =========================
     🔁 REPROCESAR PAYMENT
  ========================= */
  const reprocessPayment = async (payment_id: string) => {
    try {
      const res = await fetch("/api/admin/reconcile/auto", {
        method: "POST",
        body: JSON.stringify({ payment_id })
      })

      if (res.ok) {
        alert("✅ Pago reprocesado")
        load()
      } else {
        alert("❌ Error reprocesando pago")
      }
    } catch (err) {
      console.error(err)
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

        {/* RESUMEN */}
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <p>Total issues: {data?.issues_found || 0}</p>
        </div>

        {/* OK */}
        {data?.issues_found === 0 && (
          <div className="bg-green-900/30 border border-green-500 p-4 rounded">
            ✔ Todo está conciliado correctamente
          </div>
        )}

        {/* ISSUES */}
        <div className="space-y-4">

          {data?.issues?.map((i: any, idx: number) => (
            <div
              key={idx}
              className="bg-red-900/30 p-4 rounded border border-red-500 space-y-3"
            >

              {/* 🧠 WALLET vs LEDGER */}
              {i.user_email && (
                <div>
                  <p className="font-bold text-lg">
                    👤 {i.user_email}
                  </p>

                  <div className="text-sm space-y-1 mt-2">
                    <p>Ledger: ${Number(i.ledger_balance || 0).toLocaleString()}</p>
                    <p>Wallet: ${Number(i.wallet_balance || 0).toLocaleString()}</p>

                    <p className="text-red-400 font-semibold">
                      Diferencia: ${Number(i.diff || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* 💳 PAYMENT ISSUE */}
              {i.payment_id && (
                <div className="bg-red-950 p-3 rounded border border-red-400">

                  <p className="font-semibold">
                    ⚠️ Payment inconsistente
                  </p>

                  <p className="text-sm">
                    ID: {i.payment_id}
                  </p>

                  <div className="flex gap-2 mt-3">

                    <button
                      onClick={() => reprocessPayment(i.payment_id)}
                      className="bg-yellow-500 text-black px-3 py-1 rounded"
                    >
                      🔁 Reprocesar
                    </button>

                    <a
                      href={`/admin/payments/${i.payment_id}`}
                      className="bg-white text-black px-3 py-1 rounded"
                    >
                      🔍 Ver detalle
                    </a>

                  </div>

                </div>
              )}

              {/* 💸 PAYOUT ISSUE */}
              {i.payout_id && (
                <div className="bg-orange-950 p-3 rounded border border-orange-400">
                  <p className="font-semibold">
                    ⚠️ Payout inconsistente
                  </p>

                  <p className="text-sm">
                    ID: {i.payout_id}
                  </p>
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

    </main>
  )
}
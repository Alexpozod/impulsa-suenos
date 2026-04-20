"use client"

import { useEffect, useState } from "react"
import LedgerTable from "@/app/components/finance/LedgerTable"
import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"
import FinancialAlerts from "@/app/components/finance/FinancialAlerts"

export default function DashboardPage() {

  const { data, loading } = useFinancialDashboard()
  console.log("🔥 DATA DASHBOARD:", data)

  const [ledger, setLedger] = useState<any[]>([])

  /* =========================
     🔄 LOAD LEDGER
  ========================= */
  useEffect(() => {
    if (Array.isArray(data?.campaigns) && data.campaigns.length > 0) {
      loadLedger()
    }
  }, [data])

  const loadLedger = async () => {
    try {

      const res = await fetch("/api/ledger")
      const all = await res.json()

      if (!Array.isArray(all)) return

      const campaignIds = (data?.campaigns || []).map((c: any) => c.id)

      const filtered = all
        .filter((tx: any) =>
          campaignIds.includes(tx.campaign_id) &&
          (tx.type === "payment" || tx.type === "withdraw")
        )
        .sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

      setLedger(filtered.slice(0, 10))

    } catch (err) {
      console.error("Error loading ledger:", err)
    }
  }

  /* =========================
     🧠 STATES
  ========================= */
  if (loading) return <div className="p-10">Cargando...</div>
  if (!data) return <div className="p-10">Error cargando datos</div>

  const totals = data?.totals || {}
  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : []

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-8">

      <FinancialAlerts data={data} />

      <section className="grid md:grid-cols-5 gap-4">
        <Card title="Disponible" value={totals.balance} highlight />
        <Card title="Recaudado" value={totals.raised} />
        <Card title="Comisiones" value={totals.fees} />
        <Card title="Retirado" value={totals.withdrawn} />
        <Card title="Pendiente" value={totals.pending} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Tus campañas</h2>

        {campaigns.length === 0 && (
          <p className="text-gray-500 text-sm">
            Aún no tienes campañas creadas
          </p>
        )}

        <div className="space-y-4">

          {campaigns.map((c: any) => (
            <div key={c.id} className="border rounded-xl p-4">

              <div className="flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">{c.title}</h3>

                  <p className="text-sm text-gray-500">
  Disponible: $
  {Number(
    ledger
      .filter((tx: any) => tx.campaign_id === c.id)
      .reduce((acc: number, tx: any) => acc + Number(tx.amount || 0), 0)
  ).toLocaleString()}
</p>
                </div>

                <div className="flex gap-2">

                  <a
                    href={`/campaign/${c.id}`}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Ver
                  </a>

                  <a
                    href={`/account/withdraw?campaign=${c.id}`}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Retirar
                  </a>

                  <a
                    href={`/dashboard/campaigns/${c.id}/updates`}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Updates
                  </a>

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">
          Movimientos recientes
        </h2>

        <LedgerTable ledger={ledger} />
      </section>

    </main>
  )
}

function Card({ title, value, highlight }: any) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        highlight ? "bg-green-50 border-green-400" : ""
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
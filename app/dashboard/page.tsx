"use client"

import { useEffect, useState } from "react"
import LedgerTable from "@/app/components/finance/LedgerTable"
import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"
import FinancialAlerts from "@/app/components/finance/FinancialAlerts"
import Link from "next/link"

export default function DashboardPage() {

  const { data, loading } = useFinancialDashboard()

  const [ledger, setLedger] = useState<any[]>([])

  useEffect(() => {
    if (Array.isArray(data?.movements)) {
      setLedger(data.movements)
    } else {
      setLedger([])
    }
  }, [data])

  if (loading) return <div className="p-10">Cargando...</div>

  if (!data) {
    return (
      <div className="p-10 text-red-500">
        Error cargando datos (revisa sesión)
      </div>
    )
  }

  const totals = data?.totals || {
    balance: 0,
    raised: 0,
    fees: 0,
    withdrawn: 0,
    pending: 0
  }

  const campaigns = Array.isArray(data?.campaigns)
    ? data.campaigns.slice(0, 2) // 🔥 SOLO PREVIEW
    : []

  return (
    <main className="space-y-8">

      <FinancialAlerts data={data} />

      {/* =========================
         💰 RESUMEN
      ========================= */}
      <section className="grid md:grid-cols-5 gap-4">
        <Card title="Disponible" value={totals.balance} highlight />
        <Card title="Recaudado" value={totals.raised} />
        <Card title="Comisiones" value={totals.fees} />
        <Card title="Retirado" value={totals.withdrawn} />
        <Card title="Pendiente" value={totals.pending} />
      </section>

      {/* =========================
         📢 PREVIEW CAMPAÑAS
      ========================= */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tus campañas</h2>

          <Link
            href="/dashboard/campaigns"
            className="text-sm text-green-600 hover:underline"
          >
            Ver todas →
          </Link>
        </div>

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
                    Disponible: ${Number(c.available || 0).toLocaleString()}
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

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* =========================
         📊 MOVIMIENTOS
      ========================= */}
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
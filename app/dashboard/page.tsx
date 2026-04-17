"use client"

import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"

export default function DashboardPage() {

  const { data, loading } = useFinancialDashboard()

  if (loading) return <div className="p-10">Cargando...</div>
  if (!data) return <div className="p-10">Error cargando datos</div>

  const { totals, campaigns } = data

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-8">

      {/* 💰 RESUMEN */}
      <section className="grid md:grid-cols-5 gap-4">

        <Card title="Disponible" value={totals.balance} highlight />
        <Card title="Recaudado" value={totals.raised} />
        <Card title="Comisiones" value={totals.fees} />
        <Card title="Retirado" value={totals.withdrawn} />
        <Card title="Pendiente" value={totals.pending} />

      </section>

      {/* 📊 CAMPAÑAS */}
      <section>
        <h2 className="text-xl font-bold mb-4">Tus campañas</h2>

        <div className="space-y-4">

          {campaigns.map((c: any) => (
            <div key={c.id} className="border rounded-xl p-4">

              <div className="flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">{c.title}</h3>

                  <p className="text-sm text-gray-500">
                    Disponible: ${c.available.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/campaign/${c.id}`}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Ver
                  </a>

                  <a
                    href={`/account/withdraw?campaign=${c.id}`}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Retirar
                  </a>
                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

    </main>
  )
}

/* ================= UI ================= */

function Card({ title, value, highlight }: any) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "bg-green-50 border-green-400" : ""}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}
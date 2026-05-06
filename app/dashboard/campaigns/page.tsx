"use client"

import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"
import { formatMoney } from "@/src/lib/formatMoney"

export default function CampaignsPage() {

  const { data, loading } = useFinancialDashboard()

  if (loading) {
    return <div className="p-10">Cargando campañas...</div>
  }

  if (!data) {
    return (
      <div className="p-10 text-red-500">
        Error cargando campañas
      </div>
    )
  }

  const campaigns = Array.isArray(data.campaigns)
    ? data.campaigns
    : []

  return (
    <main className="space-y-6">

      <h1 className="text-2xl font-bold">
        📢 Mis campañas
      </h1>

      {campaigns.length === 0 && (
        <p className="text-gray-500 text-sm">
          Aún no tienes campañas creadas
        </p>
      )}

      <div className="space-y-4">

        {campaigns.map((c: any) => (

          <div
            key={c.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >

            <div>
              <p className="font-semibold">{c.title}</p>

              {/* 🔥 RECAUDADO REAL */}
              <p className="text-sm text-gray-500">
               Recaudado: {formatMoney(c.raised || c.total_raised || 0)}
              </p>

              {/* 🔥 DISPONIBLE REAL */}
              <p className="text-sm text-gray-500">
                Disponible: {formatMoney(c.available || 0)}
              </p>

              <p className="text-xs text-gray-400">
                {c.created_at
                  ? new Date(c.created_at).toLocaleDateString()
                  : "Sin fecha"}
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
                href={`/dashboard/finance?campaign=${c.id}`}
                className="text-sm px-3 py-1 bg-primary text-white rounded hover:bg-primaryHover"
              >
                Retirar
              </a>

              <a
                href={`/dashboard/edit/${c.id}`}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
              >
                Editar
              </a>

            </div>

          </div>

        ))}

      </div>

    </main>
  )
}
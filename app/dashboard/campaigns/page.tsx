"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function CampaignsPage() {

  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {

    try {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user?.email) {
        setLoading(false)
        return
      }

      const email = userData.user.email.toLowerCase()

      /* =========================
         🔥 USAR FUENTE REAL (ENRICHED)
      ========================= */
      const res = await fetch("/api/campaigns/enriched")
      const allCampaigns = await res.json()

      if (!Array.isArray(allCampaigns)) {
        setCampaigns([])
        setLoading(false)
        return
      }

      /* =========================
         🔐 FILTRAR SOLO USUARIO
      ========================= */
      const userCampaigns = allCampaigns
        .filter((c: any) => c.user_email === email)
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

      setCampaigns(userCampaigns)

    } catch (error) {
      console.error("Error cargando campañas:", error)
      setCampaigns([])
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-10">Cargando campañas...</div>
  }

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

        {campaigns.map((c) => (

          <div
            key={c.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >

            <div>
              <p className="font-semibold">{c.title}</p>

              {/* 🔥 DATOS REALES DESDE LEDGER */}
              <p className="text-sm text-gray-500">
                Recaudado: ${Number(c.current_amount || 0).toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                Disponible: ${Number(c.current_amount || 0).toLocaleString()}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleDateString()}
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
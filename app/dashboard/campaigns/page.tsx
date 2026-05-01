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

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user?.email) {
      setLoading(false)
      return
    }

    const email = userData.user.email.toLowerCase()

    const { data } = await supabase
      .from("campaigns")
      .select(`
        id,
        title,
        goal_amount,
        balance,
        total_raised,
        created_at,
        status
      `)
      .eq("user_email", email)
      .order("created_at", { ascending: false })

    setCampaigns(data || [])
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

              <p className="text-sm text-gray-500">
                Recaudado: ${Number(c.total_raised || 0).toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                Disponible: ${Number(c.balance || 0).toLocaleString()}
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
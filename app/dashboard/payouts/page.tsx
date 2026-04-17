"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PayoutsPage() {

  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (!token) {
        setLoading(false)
        return
      }

      const resFinance = await fetch("/api/user/finance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const finance = await resFinance.json()

      const resPayouts = await fetch("/api/payout")
      const all = await resPayouts.json()

      if (!finance?.campaigns || !Array.isArray(all)) {
        setPayouts([])
        return
      }

      const campaignIds = finance.campaigns.map((c: any) => c.id)

      const filtered = all.filter((p: any) =>
        campaignIds.includes(p.campaign_id)
      )

      setPayouts(filtered)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-10">Cargando...</div>

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Historial de retiros
      </h1>

      {payouts.length === 0 && (
        <p className="text-gray-500">
          Aún no has realizado retiros
        </p>
      )}

      <div className="space-y-4">

        {payouts.map((p: any) => {

          const getStatus = () => {
            switch (p.status) {
              case "pending":
                return { label: "Pendiente", color: "text-yellow-600" }
              case "paid":
                return { label: "Pagado", color: "text-green-600" }
              case "rejected":
                return { label: "Rechazado", color: "text-red-600" }
              default:
                return { label: p.status, color: "text-gray-600" }
            }
          }

          const status = getStatus()

          return (
            <div key={p.id} className="border rounded-xl p-4 flex justify-between">

              <div>
                <p className="font-semibold">
                  ${Number(p.amount || 0).toLocaleString()}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>

              <div className={`font-semibold ${status.color}`}>
                {status.label}
              </div>

            </div>
          )
        })}

      </div>

    </main>
  )
}
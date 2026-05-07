"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { formatMoney } from "@/src/lib/formatMoney"

export default function DonationsPage() {

  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<any[]>([])

  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = async () => {

    try {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user?.email) {
        setLoading(false)
        return
      }

      const email =
        userData.user.email.toLowerCase()

      console.log("USER EMAIL:", email)

      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          campaign_id,
          created_at,
          status
        `)
        .eq("user_email", email)
        .order("created_at", { ascending: false })

      console.log("SUPABASE ERROR:", error)
      console.log("PAYMENTS:", data)

      setDonations(data || [])

    } catch (err) {

      console.error(
        "LOAD DONATIONS ERROR:",
        err
      )

    } finally {

      setLoading(false)

    }

  }

  if (loading) {
    return (
      <div className="p-10">
        Cargando donaciones...
      </div>
    )
  }

  return (
    <main className="space-y-6">

      <h1 className="text-2xl font-bold">
        🎁 Donaciones realizadas
      </h1>

      {donations.length === 0 && (
        <p className="text-gray-500 text-sm">
          Aún no has realizado donaciones
        </p>
      )}

      <div className="space-y-4">

        {donations.map((d) => (

          <div
            key={d.id}
            className="
              bg-white
              border
              rounded-xl
              p-4
              flex
              justify-between
              items-center
            "
          >

            <div>

              <p className="font-semibold">
                Donación realizada
              </p>

              <p className="text-sm text-gray-500">
                Campaña: {d.campaign_id}
              </p>

              <p className="text-xs text-gray-400">
                Estado: {d.status}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(
                  d.created_at
                ).toLocaleDateString()}
              </p>

            </div>

            <div className="text-green-600 font-bold">
              {formatMoney(d.amount)}
            </div>

          </div>

        ))}

      </div>

    </main>
  )
}
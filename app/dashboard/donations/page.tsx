"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/src/lib/supabase"
import { formatMoney } from "@/src/lib/formatMoney"

type Donation = {
  id: string
  amount: number
  campaign_id: string
  created_at?: string | null
  status: string
  campaign_title?: string
}

export default function DonationsPage() {

  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])

  const loadDonations = useCallback(async () => {

  try {

    const { data: userData } =
      await supabase.auth.getUser()

    if (!userData?.user?.email) {
      setLoading(false)
      return
    }

    const email =
      userData.user.email.toLowerCase()

    // DONACIONES
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        campaign_id,
        created_at,
        status
      `)
      .eq("donor_email", email)
      .eq("status", "approved")
      .order("created_at", {
        ascending: false
      })

    if (error) {
      console.error(
        "SUPABASE DONATIONS ERROR:",
        error
      )
    }

    // IDS CAMPAÑAS
    const campaignIds =
      [...new Set(
        (data || []).map(d => d.campaign_id)
      )]

    // CAMPAÑAS
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", campaignIds)

    // MAPA
    const campaignMap =
      Object.fromEntries(
        (campaigns || []).map(c => [
          c.id,
          c.title
        ])
      )

    // COMBINAR
    const donationsWithTitles =
      (data || []).map(d => ({
        ...d,
        campaign_title:
          campaignMap[d.campaign_id] ||
          "Campaña sin título"
      }))

    setDonations(donationsWithTitles)

  } catch (err) {

    console.error(
      "LOAD DONATIONS ERROR:",
      err
    )

  } finally {

    setLoading(false)

  }

}, [])

      useEffect(() => {

  loadDonations()

  const interval = setInterval(() => {
    loadDonations()
  }, 5000)

  return () => clearInterval(interval)

}, [loadDonations])

  if (loading) {

    return (

      <div className="
        flex
        items-center
        justify-center
        py-20
      ">

        <div className="text-center">

          <div className="
            w-12
            h-12
            border-4
            border-green-200
            border-t-green-600
            rounded-full
            animate-spin
            mx-auto
            mb-4
          " />

          <p className="
            text-gray-500
            text-sm
          ">
            Cargando donaciones...
          </p>

        </div>

      </div>

    )

  }

  return (

        <main className="
  max-w-6xl
  space-y-6
  pb-20
">

      {/* HEADER */}
      <div className="
        flex
        items-center
        justify-between
        gap-4
        flex-wrap
      ">

        <div>

          <h1 className="
            text-3xl
            font-black
            tracking-tight
            text-gray-900
          ">
            🎁 Donaciones realizadas
          </h1>

          <p className="
            text-gray-500
            mt-1
          ">
            Historial de aportes realizados
          </p>

        </div>

        <div className="
          bg-green-50
          border
          border-green-200
          px-4
          py-2
          rounded-xl
        ">

          <p className="
            text-xs
            text-green-700
            font-medium
          ">
            Total donaciones
          </p>

          <p className="
            text-xl
            font-black
            text-green-600
          ">
           {formatMoney(
  donations.reduce(
    (acc, d) => acc + d.amount,
    0
  )
)}
          </p>

        </div>

      </div>

      {/* EMPTY */}
      {donations.length === 0 && (

        <div className="
          bg-white
          border
          rounded-2xl
          p-14
          text-center
          shadow-sm
        ">

          <div className="
            text-6xl
            mb-5
          ">
            🎁
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-gray-900
            mb-2
          ">
            No hay donaciones aún
          </h2>

          <p className="
            text-gray-500
          ">
            Tus futuras donaciones aparecerán aquí
          </p>

        </div>

      )}

      {/* LIST */}
      <div className="
  space-y-4
  flex
  flex-col
">

        {donations.map((d) => (

          <div
            key={`${d.id}-${d.created_at}`}
            className="
              w-full
              bg-white/90
              backdrop-blur-sm
              border
              border-gray-300
              rounded-2xl
              p-4
              flex
              items-center
              justify-between
              gap-4
              hover:shadow-md
              hover:border-green-200
              hover:-translate-y-0.5
              transition-all
              duration-200
            "
          >

            {/* LEFT */}
<div className="
  flex
  items-center
  gap-4
  min-w-0
">

  {/* IMAGE */}
  <div className="
    w-14
    h-14
    rounded-xl
    bg-green-100
    flex
    items-center
    justify-center
    text-2xl
    flex-shrink-0
    border
  ">
    🎁
  </div>

  {/* INFO */}
  <div className="min-w-0">

    <h3 className="
  font-bold
  text-gray-900
  truncate
">
  {d.campaign_title}
</h3>

                <div className="
                  flex
                  items-center
                  gap-2
                  mt-2
                  flex-wrap
                ">

                 <span className="
                    text-xs
                    text-gray-400
                  ">
                    {d.created_at
                      ? new Date(d.created_at).toLocaleDateString(
                          "es-CL",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          }
                        )
                      : "Sin fecha"}
                  </span>

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="
              text-right
              flex
              flex-col
              items-end
              gap-2
            ">

              <p className="
                text-2xl
                font-black
                text-[#0F9D58]
              ">
                {formatMoney(d.amount)}
              </p>

              <Link
                href={`/campaign/${d.campaign_id}`}
                className="
                  text-sm
                  font-semibold
                  text-green-700
                  hover:text-green-800
                  hover:underline
                  transition
                "
              >
                Ver campaña →
              </Link>

            </div>

          </div>

        ))}

      </div>

    </main>

  )

}
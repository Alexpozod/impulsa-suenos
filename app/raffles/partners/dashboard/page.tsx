"use client"

import { useEffect, useState } from "react"

import { supabase }
from "@/src/lib/supabase"

export default function RafflePartnerDashboardPage() {

  const [data, setData] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/dashboard",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setData(json)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  if (loading) {

    return (
      <div className="p-8">
        Cargando dashboard...
      </div>
    )

  }

  if (!data?.affiliate) {

    return (

      <div className="p-8">

        <h1 className="text-3xl font-bold">
          Partners
        </h1>

        <p className="mt-4 text-slate-400">
          No tienes una cuenta de afiliado asignada.
        </p>

      </div>

    )

  }

  return (

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          🚀 Partner Dashboard
        </h1>

        <p className="text-slate-400 mt-2">

          Código:

          {" "}

          <span className="font-bold text-white">
            {data.affiliate.code}
          </span>

        </p>

      </div>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      "
      >

        <Card
          title="Comisión"
          value={`${data.affiliate.commissionPercent}%`}
        />

        <Card
          title="Clicks"
          value={data.stats.clicks}
        />

        <Card
          title="Checkouts"
          value={data.stats.beginCheckout}
        />

        <Card
          title="Pagos"
          value={data.stats.paidOrders}
        />

        <Card
          title="Revenue"
          value={`$${Number(
            data.stats.revenue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Comisión Estimada"
          value={`$${Number(
            data.stats.estimatedCommission || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Comisión Pagada"
          value={`$${Number(
            data.stats.paidCommission || 0
          ).toLocaleString()}`}
        />

      </div>

    </div>

  )

}

function Card({
  title,
  value
}: any) {

  return (

    <div
      className="
      bg-gradient-to-br
      from-slate-900
      to-slate-950
      border
      border-slate-800
      rounded-3xl
      p-5
    "
    >

      <p
        className="
        text-slate-400
        text-sm
      "
      >
        {title}
      </p>

      <h3
        className="
        text-3xl
        font-bold
        mt-3
        text-white
      "
      >
        {value}
      </h3>

    </div>

  )

}
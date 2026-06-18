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

      <div
  className="
    rounded-3xl
    p-8
    text-white
    bg-gradient-to-r
    from-blue-600
    via-purple-600
    to-cyan-500
  "
>

  <div className="flex items-center gap-4">

    <img
      src="/favicon-removebg-preview.png"
      alt="Partners"
      className="w-16 h-16"
    />

    <div>

      <h1 className="text-4xl font-black">
        Programa de Partners
      </h1>

      <p className="opacity-90 mt-2">
        Comparte sorteos y gana comisiones por cada venta.
      </p>

    </div>

  </div>

  <div
    className="
      mt-8
      bg-white/10
      backdrop-blur
      rounded-2xl
      p-5
    "
  >

    <div className="text-sm opacity-80">
      Código Afiliado
    </div>

    <div
      className="
        text-4xl
        font-black
        mt-2
      "
    >
      {data.affiliate.code}
    </div>

    <div className="flex gap-3 mt-5">

      <button
        onClick={() => {
          navigator.clipboard.writeText(
            data.affiliate.code
          )

          alert(
            "Código copiado"
          )
        }}
        className="
          px-5
          py-3
          rounded-xl
          bg-white
          text-black
          font-bold
        "
      >
        Copiar Código
      </button>

      <a
        href="/raffles/partners/links"
        className="
          px-5
          py-3
          rounded-xl
          border
          border-white/30
          font-bold
        "
      >
        Ver Links
      </a>

    </div>

  </div>

</div>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
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
      from-blue-950
      to-purple-950
      border
      border-blue-800/30
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
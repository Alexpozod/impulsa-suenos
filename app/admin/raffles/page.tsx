"use client"

import { useEffect, useState }

from "react"

export default function AdminRafflesPage() {

  const [data, setData] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const res =
        await fetch(
          "/api/admin/raffles/analytics"
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
      <div className="p-6">
        Cargando...
      </div>
    )
  }

  return (

    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          🎟️ Raffles Admin
        </h1>

        <p className="text-slate-500 mt-1">
          Analytics y revenue
        </p>

      </div>

      {/* METRICS */}

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
          title="Revenue"
          value={`$${Number(
            data?.revenue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Pagos"
          value={data?.payments || 0}
        />

        <Card
          title="Tickets"
          value={data?.tickets || 0}
        />

        <Card
          title="Conversión"
          value={`${Number(
            data?.conversionRate || 0
          ).toFixed(2)}%`}
        />

      </div>

      {/* CHECKOUT */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        <Card
          title="Begin Checkout"
          value={data?.beginCheckout || 0}
        />

        <Card
          title="Payment Success"
          value={data?.paymentSuccess || 0}
        />

        <Card
          title="Payment Failed"
          value={data?.paymentFailed || 0}
        />

      </div>

      {/* SOURCES */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          p-5
        "
      >

        <h2 className="font-semibold text-lg mb-4">
          📊 Sources
        </h2>

        <div className="space-y-3">

          {Object.entries(
            data?.sources || {}
          ).map(

            ([key, value]: any) => (

              <div
                key={key}
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  pb-2
                "
              >

                <div>
                  <p className="font-medium">
                    {key}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold">
                    $
                    {Number(
                      value.revenue || 0
                    ).toLocaleString()}
                  </p>

                  <p className="text-sm text-slate-500">
                    {value.conversions}
                    {" "}
                    conversiones
                  </p>

                </div>

              </div>
            )
          )}

        </div>

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
        bg-white
        border
        rounded-2xl
        p-5
      "
    >

      <p className="text-slate-500 text-sm">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-2">
        {value}
      </h3>

    </div>
  )
}
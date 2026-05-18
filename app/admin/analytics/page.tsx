"use client"

import { useEffect, useState } from "react"

export default function AdminAnalyticsPage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    try {

      const res = await fetch("/api/admin/analytics")

      const json = await res.json()

      setData(json)

    } catch (err) {

      console.error("analytics load error", err)

    } finally {

      setLoading(false)

    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Cargando analytics...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-10">
        Error cargando analytics
      </div>
    )
  }

  return (

    <main className="p-6 space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          📊 Analytics
        </h1>

        <p className="text-gray-500 mt-1">
          Funnel y métricas globales
        </p>
      </div>

      {/* =========================
          FUNNEL
      ========================= */}

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <Card
          title="Visitas"
          value={data.funnel.views}
        />

        <Card
          title="Clicks Donar"
          value={data.funnel.donate_clicks}
        />

        <Card
          title="Checkouts"
          value={data.funnel.checkouts}
        />

        <Card
          title="Pagos"
          value={data.funnel.payments}
        />

        <Card
          title="Conversión"
          value={`${data.funnel.conversion}%`}
        />

      </section>

      {/* =========================
          TOP CAMPAÑAS
      ========================= */}

      <section className="bg-white border rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">
          🏆 Top campañas
        </h2>

        <div className="space-y-3">

          {data.topCampaigns?.map((campaign: any) => (

            <div
              key={campaign.campaign_id}
              className="flex justify-between border rounded-xl p-3"
            >

              <div>
                <p className="font-semibold">
                  {campaign.campaign_id}
                </p>

                <p className="text-sm text-gray-500">
                  {campaign.views} visitas
                </p>
              </div>

              <div className="font-bold text-green-600">
                {campaign.payments} pagos
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =========================
          TOP SOURCES
      ========================= */}

      <section className="bg-white border rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">
          🌍 Top fuentes
        </h2>

        <div className="space-y-3">

          {data.topSources?.map((source: any) => (

            <div
              key={source.source}
              className="flex justify-between border rounded-xl p-3"
            >

              <div>
                <p className="font-semibold">
                  {source.source}
                </p>

                <p className="text-sm text-gray-500">
                  {source.payments} pagos
                </p>
              </div>

              <div className="font-bold text-green-600">
                $
                {Number(source.revenue || 0)
                  .toLocaleString()}
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =========================
          ABANDONADOS
      ========================= */}

      <section className="bg-white border rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">
          ⚠️ Checkout abandonados
        </h2>

        <div className="space-y-3">

          {data.abandoned?.length === 0 && (
            <p className="text-gray-500">
              No hay abandonos
            </p>
          )}

          {data.abandoned?.map((item: any) => (

            <div
              key={item.id}
              className="border rounded-xl p-3"
            >

              <p className="font-semibold">
                {item.user_email}
              </p>

              <p className="text-sm text-gray-500">
                Intentó donar $
                {Number(item.metadata?.amount || 0)
                  .toLocaleString()}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =========================
          REALTIME
      ========================= */}

      <section className="bg-white border rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">
          ⚡ Actividad reciente
        </h2>

        <div className="space-y-3">

          {data.realtime?.map((event: any) => (

            <div
              key={event.id}
              className="border rounded-xl p-3"
            >

              <div className="flex justify-between">

                <p className="font-semibold">
                  {event.event_type}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(event.created_at)
                    .toLocaleString()}
                </p>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                {event.user_email || "visitante"}
              </p>

            </div>

          ))}

        </div>

      </section>

    </main>
  )
}

function Card({
  title,
  value
}: {
  title: string
  value: any
}) {

  return (

    <div className="bg-white border rounded-2xl p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  )
}
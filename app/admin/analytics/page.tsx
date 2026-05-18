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

   <main className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">

  {/* HEADER */}
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      📊 Analytics
    </h1>

    <p className="text-sm text-gray-500 mt-1">
      Funnel y métricas globales
    </p>
  </div>

  {/* FUNNEL */}
  <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

    <Card
      title="Visitas"
      value={data.funnel.views}
    />

    <Card
      title="Clicks"
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

  {/* GRID */}
  <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

    {/* TOP CAMPAÑAS */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        🏆 Top campañas
      </h2>

      <div className="space-y-3">

        {data.topCampaigns?.map((campaign: any) => (

          <div
            key={campaign.campaign_id}
            className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
          >

            <div className="min-w-0">

              <p className="font-medium text-sm truncate">
                {campaign.campaign_id}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {campaign.views} visitas
              </p>

            </div>

            <div className="text-sm font-bold text-green-600">
              {campaign.payments} pagos
            </div>

          </div>

        ))}

      </div>

    </div>

    {/* TOP SOURCES */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        🌍 Top fuentes
      </h2>

      <div className="space-y-3">

        {data.topSources?.map((source: any) => (

          <div
            key={source.source}
            className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
          >

            <div>

              <p className="font-medium text-sm">
                {source.source}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {source.payments} pagos
              </p>

            </div>

            <div className="text-sm font-bold text-green-600">
              $
              {Number(source.revenue || 0)
                .toLocaleString()}
            </div>

          </div>

        ))}

      </div>

    </div>

  </section>

  {/* ABANDONADOS */}
  <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

    <h2 className="text-lg font-semibold mb-4">
      ⚠️ Checkout abandonados
    </h2>

    <div className="space-y-3">

      {data.abandoned?.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay abandonos
        </p>
      )}

      {data.abandoned?.map((item: any) => (

        <div
          key={item.id}
          className="border border-gray-100 rounded-xl px-4 py-3"
        >

          <p className="font-medium text-sm">
            {item.user_email}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Intentó donar $
            {Number(item.metadata?.amount || 0)
              .toLocaleString()}
          </p>

        </div>

      ))}

    </div>

  </section>

  {/* REALTIME */}
  <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

    <h2 className="text-lg font-semibold mb-4">
      ⚡ Actividad reciente
    </h2>

    <div className="space-y-3">

      {data.realtime?.map((event: any) => (

        <div
          key={event.id}
          className="border border-gray-100 rounded-xl px-4 py-3"
        >

          <div className="flex items-center justify-between gap-3">

            <p className="font-medium text-sm">
              {event.event_type}
            </p>

            <p className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(event.created_at)
                .toLocaleString()}
            </p>

          </div>

          <p className="text-xs text-gray-500 mt-1">
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

    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </p>

    </div>
  )
}
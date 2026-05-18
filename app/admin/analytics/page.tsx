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

   <main className="min-h-screen bg-[#020617] p-6 space-y-6 text-white">

  {/* HEADER */}
  <div>
    <h1 className="text-2xl font-bold text-white">
      📊 Analytics
    </h1>

    <p className="text-sm text-slate-400 mt-1">
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
<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

  <div className="flex items-center justify-between mb-4">

    <h2 className="text-lg font-semibold">
      🏆 Top campañas
    </h2>

    <span className="text-xs text-slate-400">
      Más conversiones
    </span>

  </div>

  <div className="space-y-4">

    {data.topCampaigns?.map((campaign: any) => (

      <div
        key={campaign.campaign_id}
        className="rounded-2xl border border-white/10 bg-black/20 p-4"
      >

        <div className="flex items-start justify-between gap-4">

          {/* LEFT */}
          <div className="min-w-0 flex-1">

            <p className="font-semibold text-white truncate">
              {campaign.title}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              por {campaign.organizer}
            </p>

          </div>

          {/* RIGHT */}
          <div className="text-right">

            <p className="text-green-400 font-bold text-sm">
              $
              {Number(campaign.revenue || 0)
                .toLocaleString()}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              revenue
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mt-4">

          <div className="rounded-xl bg-white/5 p-3">

            <p className="text-xs text-slate-400">
              Visitas
            </p>

            <p className="font-bold mt-1">
              {campaign.views}
            </p>

          </div>

          <div className="rounded-xl bg-white/5 p-3">

            <p className="text-xs text-slate-400">
              Pagos
            </p>

            <p className="font-bold mt-1 text-green-400">
              {campaign.payments}
            </p>

          </div>

          <div className="rounded-xl bg-white/5 p-3">

            <p className="text-xs text-slate-400">
              Conversión
            </p>

            <p className="font-bold mt-1 text-cyan-400">
              {campaign.conversion}%
            </p>

          </div>

        </div>

      </div>

    ))}

  </div>

</div>

    {/* TOP SOURCES */}
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

      <h2 className="text-lg font-semibold mb-4">
        🌍 Top fuentes
      </h2>

      <div className="space-y-3">

        {data.topSources?.map((source: any) => (

          <div
            key={source.source}
            className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3"
          >

            <div>

              <p className="font-medium text-sm">
                {source.source}
              </p>

              <p className="text-xs text-slate-400 mt-1">
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
  <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

    <h2 className="text-lg font-semibold mb-4">
      ⚠️ Checkout abandonados
    </h2>

    <div className="space-y-3">

      {data.abandoned?.length === 0 && (
        <p className="text-sm text-slate-400">
          No hay abandonos
        </p>
      )}

      {data.abandoned?.map((item: any) => (

        <div
          key={item.id}
          className="border border-white/10 rounded-xl px-4 py-3"
        >

          <p className="font-medium text-sm">
            {item.user_email}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Intentó donar $
            {Number(item.metadata?.amount || 0)
              .toLocaleString()}
          </p>

        </div>

      ))}

    </div>

  </section>

  {/* REALTIME */}
  <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

    <h2 className="text-lg font-semibold mb-4">
      ⚡ Actividad reciente
    </h2>

    <div className="space-y-3">

      {data.realtime?.map((event: any) => (

        <div
          key={event.id}
          className="border border-white/10 rounded-xl px-4 py-3"
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

          <p className="text-xs text-slate-400 mt-1">
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

    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="text-2xl font-bold text-white mt-2">
        {value}
      </p>

    </div>
  )
}
"use client"

import { useEffect, useState } from "react"

export default function AdminAnalyticsPage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("7d")

  useEffect(() => {

  load()

  const interval = setInterval(() => {
    load()
  }, 15000)

  return () => clearInterval(interval)

}, [range])

  const load = async () => {

    try {

      const res = await fetch(
  `/api/admin/analytics?range=${range}`
)

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

{/* RANGE FILTERS */}
<section className="flex items-center gap-3">

  {["24h", "7d", "30d"].map((item) => (

    <button
      key={item}
      onClick={() => setRange(item)}
      className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
        range === item
          ? "bg-emerald-500 text-white"
          : "bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800"
      }`}
    >
      {item}
    </button>

  ))}

</section>

  {/* HEADER */}
  <div>
    <h1 className="text-2xl font-bold text-white">
      📊 Analytics
    </h1>

    <p className="text-sm text-slate-400 mt-1">
      Funnel y métricas globales
    </p>
  </div>

{/* =========================
    🔥 INSIGHTS
========================= */}

{data.insights?.length > 0 && (

  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

    {data.insights.map(
      (insight: string, index: number) => (

        <div
          key={index}
          className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-950/20 to-slate-950 p-4 shadow-[0_0_25px_rgba(6,182,212,0.08)]"
        >

          <p className="text-sm text-cyan-100 leading-relaxed">

            {insight}

          </p>

        </div>

      )
    )}

  </section>

)}

{/* =========================
    💰 REVENUE
========================= */}

<section className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <RevenueCard
    title="Revenue Total"
    value={`$${Number(
      data.revenue?.total || 0
    ).toLocaleString()}`}
    subtitle="Ingresos históricos"
  />

  <RevenueCard
    title="Revenue Hoy"
    value={`$${Number(
      data.revenue?.today || 0
    ).toLocaleString()}`}
    subtitle="Ingresos del día"
  />

  <RevenueCard
    title="Ticket Promedio"
    value={`$${Number(
      data.revenue?.average_ticket || 0
    ).toLocaleString()}`}
    subtitle="Promedio por donación"
  />

</section>

{/* =========================
    📈 REVENUE CHART
========================= */}

<section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-lg font-semibold text-white">
        📈 Revenue últimos 14 días
      </h2>

      <p className="text-xs text-slate-400 mt-1">
        Evolución de ingresos
      </p>

    </div>

  </div>

  <div className="flex items-end gap-3 h-56 overflow-hidden">

  {data.revenueChart?.map((item: any) => {

    const maxRevenue = Math.max(
      ...data.revenueChart.map(
        (d: any) => d.revenue
      ),
      1
    )

    const height =
      Math.max(
        (item.revenue / maxRevenue) * 100,
        8
      )

    return (

      <div
        key={item.date}
        className="flex flex-col items-center justify-end h-full w-16"
      >

        <div className="text-[11px] text-emerald-400 mb-2 font-medium">
          $
          {Number(item.revenue)
            .toLocaleString()}
        </div>

        <div
          className="w-10 rounded-t-2xl bg-gradient-to-t from-emerald-600 to-emerald-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          style={{
            height: `${height}%`
          }}
        />

        <p className="text-[10px] text-slate-500 mt-3">
          {item.date.slice(5)}
        </p>

      </div>
    )
  })}

</div>

</section>

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

  <div className="flex items-center justify-between mb-4">

    <h2 className="text-lg font-semibold">
      🌍 Top fuentes
    </h2>

    <span className="text-xs text-slate-400">
      Tráfico con más revenue
    </span>

  </div>

  <div className="space-y-4">

    {data.topSources?.map((source: any, index: number) => {

      const maxRevenue = Math.max(
        ...data.topSources.map(
          (s: any) => s.revenue || 0
        ),
        1
      )

      const percent =
        ((source.revenue || 0) / maxRevenue) * 100

      return (

        <div
          key={source.source}
          className="rounded-2xl border border-white/10 bg-black/20 p-4"
        >

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                #{index + 1}
              </div>

              <div>

                <p className="font-semibold text-white capitalize">
                  {source.source}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {source.payments} pagos registrados
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="text-green-400 font-bold">
                $
                {Number(source.revenue || 0)
                  .toLocaleString()}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                revenue
              </p>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="mt-4">

            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                style={{
                  width: `${percent}%`
                }}
              />

            </div>

          </div>

        </div>
      )
    })}

  </div>

</div>

  </section>

  {/* =========================
    ⚠️ ABANDONADOS PRO
========================= */}

<section className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(251,191,36,0.06)]">

  <div className="flex items-center justify-between mb-5">

    <div>

      <h2 className="text-lg font-semibold text-white">
        ⚠️ Checkout abandonados
      </h2>

      <p className="text-xs text-slate-400 mt-1">
        Usuarios que iniciaron pago pero no completaron
      </p>

    </div>

    <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">

      {data.abandoned?.length || 0} abandonos

    </div>

  </div>

  <div className="space-y-4">

    {data.abandoned?.length === 0 && (

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">

        <p className="text-slate-400 text-sm">
          No hay abandonos detectados
        </p>

      </div>

    )}

    {data.abandoned?.map((item: any) => {

      const amount =
        Number(item.metadata?.amount || 0)

      const minutes =
        Number(item.abandoned_minutes || 0)

      const source =
        item.source || "direct"

      let severity =
        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"

      if (minutes >= 60) {

        severity =
          "text-red-400 bg-red-500/10 border-red-500/20"

      } else if (minutes >= 30) {

        severity =
          "text-amber-400 bg-amber-500/10 border-amber-500/20"
      }

      return (

        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-black/20 p-4"
        >

          <div className="flex items-start justify-between gap-4">

            {/* LEFT */}
            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2 flex-wrap">

                <p className="font-semibold text-white truncate">
                  {item.user_email}
                </p>

                <span className={`px-2 py-1 rounded-full text-[10px] border ${severity}`}>

                  {minutes} min

                </span>

              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">

                <span className="text-xs text-slate-400">
                  🌍 {source}
                </span>

                <span className="text-xs text-slate-400">
                  💰 $
                  {amount.toLocaleString()}
                </span>

              </div>

            </div>

            {/* RIGHT */}
<div className="text-right">

  <p className="text-xs text-slate-500">
    abandono
  </p>

  <p className="text-sm font-bold text-amber-400 mt-1">
    pendiente
  </p>

  {/* ACTIONS */}
  <div className="flex items-center justify-end gap-2 mt-3">

    {/* COPY EMAIL */}
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          item.user_email || ""
        )

        alert("📋 Email copiado")
      }}
      className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all"
    >
      📋
    </button>

    {/* OPEN GMAIL */}
    <button
      onClick={() => {

        const subject =
          encodeURIComponent(
            "Tu aporte sigue pendiente ❤️"
          )

        const body =
          encodeURIComponent(
`Hola,

Vimos que intentaste apoyar una campaña en ImpulsaSueños pero tu aporte quedó pendiente.

Puedes completar tu aporte cuando quieras ❤️

https://impulsasuenos.com`
          )

        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${item.user_email}&su=${subject}&body=${body}`,
          "_blank"
        )
      }}
      className="px-2 py-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-cyan-400 transition-all"
    >
      ✉️
    </button>

  </div>

</div>

          </div>

        </div>
      )
    })}

  </div>

</section>

{/* =========================
    💎 TOP DONADORES
========================= */}

<section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">

  <div className="flex items-center justify-between mb-5">

    <div>

      <h2 className="text-lg font-semibold text-white">
        💎 Top Donadores
      </h2>

      <p className="text-xs text-slate-400 mt-1">
        Usuarios con mayor aporte
      </p>

    </div>

  </div>

  <div className="space-y-4">

    {data.topDonors?.map((donor: any, index: number) => (

      <div
        key={donor.donor_email}
        className="rounded-2xl border border-white/10 bg-black/20 p-4"
      >

        <div className="flex items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-4 min-w-0">

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">

              #{index + 1}

            </div>

            <div className="min-w-0">

              <p className="font-semibold text-white truncate">
                {donor.donor_name}
              </p>

              <p className="text-xs text-slate-400 truncate mt-1">
                {donor.donor_email}
              </p>

            </div>

          </div>

          {/* RIGHT */}
          <div className="text-right">

            <p className="text-green-400 font-bold text-lg">
              $
              {Number(donor.total || 0)
                .toLocaleString()}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              total donado
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 mt-4">

          <div className="rounded-xl bg-white/5 p-3">

            <p className="text-xs text-slate-400">
              Pagos
            </p>

            <p className="font-bold mt-1 text-white">
              {donor.payments}
            </p>

          </div>

          <div className="rounded-xl bg-white/5 p-3">

            <p className="text-xs text-slate-400">
              Ticket promedio
            </p>

            <p className="font-bold mt-1 text-cyan-400">
              $
              {Number(donor.average_ticket || 0)
                .toLocaleString()}
            </p>

          </div>

        </div>

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

function RevenueCard({
  title,
  value,
  subtitle
}: {
  title: string
  value: string
  subtitle: string
}) {

  return (

    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-950 p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]">

      <p className="text-xs uppercase tracking-wide text-emerald-400">
        {title}
      </p>

      <p className="text-3xl font-bold text-white mt-3">
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-2">
        {subtitle}
      </p>

    </div>
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
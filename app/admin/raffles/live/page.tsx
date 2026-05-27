"use client"

import {
  useEffect,
  useMemo,
  useState
}
from "react"

import { supabase }
from "@/src/lib/supabase"

import PageHeader
from "@/app/components/raffles/admin/PageHeader"

import TableContainer
from "@/app/components/raffles/admin/TableContainer"

import MetricCard
from "@/app/components/raffles/admin/MetricCard"

export default function AdminRafflesLivePage() {

  const [loading, setLoading] =
    useState(true)

  const [events, setEvents] =
    useState<any[]>([])

  useEffect(() => {

    load()

    const interval =
      setInterval(
        load,
        15000
      )

    return () =>
      clearInterval(interval)

  }, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          "/api/admin/raffles/live",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setEvents(
        json?.events || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  /* =========================
     METRICS
  ========================= */

  const paymentSuccess =
    useMemo(() => {

      return events.filter(
        event =>
          event.event_type ===
          "payment_success"
      ).length

    }, [events])

  const paymentFailed =
    useMemo(() => {

      return events.filter(
        event =>
          event.event_type ===
          "payment_failed"
      ).length

    }, [events])

  const beginCheckout =
    useMemo(() => {

      return events.filter(
        event =>
          event.event_type ===
          "begin_checkout"
      ).length

    }, [events])

  const totalRevenue =
    useMemo(() => {

      return events
        .filter(
          event =>
            event.event_type ===
            "payment_success"
        )
        .reduce(
          (sum, event) =>
            sum +
            Number(
              event.metadata?.amount || 0
            ),
          0
        )

    }, [events])

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title="📡 Live Activity"
        description="Eventos operacionales en tiempo real"
      />

      {/* KPI */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <MetricCard
          title="Revenue"
          value={`$${Number(
            totalRevenue
          ).toLocaleString()}`}
        />

        <MetricCard
          title="Payment Success"
          value={paymentSuccess}
        />

        <MetricCard
          title="Payment Failed"
          value={paymentFailed}
        />

        <MetricCard
          title="Begin Checkout"
          value={beginCheckout}
        />

      </div>

      {/* TABLE */}

      <TableContainer>

        <table className="w-full">

          <thead
            className="
              bg-slate-950
              border-b border-slate-800
            "
          >

            <tr>

              <th className="p-4 text-left">
                Event
              </th>

              <th className="p-4 text-left">
                Sorteo
              </th>

              <th className="p-4 text-left">
                Source
              </th>

              <th className="p-4 text-left">
                Campaign
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Fecha
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={6}
                  className="
                    p-10
                    text-center
                    text-slate-500
                  "
                >
                  Cargando...
                </td>

              </tr>

            )}

            {!loading &&
              events.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="
                    p-10
                    text-center
                    text-slate-500
                  "
                >
                  Sin eventos
                </td>

              </tr>

            )}

            {!loading &&
              events.map((event) => (

              <tr
                key={event.id}
                className="
                  border-b border-slate-800
                "
              >

                <td className="p-4">

                  <EventBadge
                    type={event.event_type}
                  />

                </td>

                <td className="p-4">

                  <div>

                    <p className="font-medium">
                      {event.raffle?.title || "-"}
                    </p>

                    <p className="text-sm text-slate-500">
                      /{event.raffle?.slug}
                    </p>

                  </div>

                </td>

                <td className="p-4">

                  {event.source || "-"}

                </td>

                <td className="p-4">

                  {event.utm_campaign || "-"}

                </td>

                <td className="p-4 font-semibold">

                  $
                  {Number(
                    event.metadata?.amount || 0
                  ).toLocaleString()}

                </td>

                <td className="p-4 text-sm text-slate-400">

                  {new Date(
                    event.created_at
                  ).toLocaleString()}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </TableContainer>

    </div>
  )
}

function EventBadge({
  type
}: {
  type: string
}) {

  const styles: any = {

    payment_success: `
      bg-emerald-500/10
      text-emerald-300
      border-emerald-500/20
    `,

    payment_failed: `
      bg-red-500/10
      text-red-300
      border-red-500/20
    `,

    begin_checkout: `
      bg-blue-500/10
      text-blue-300
      border-blue-500/20
    `,

    ticket_reserved: `
      bg-amber-500/10
      text-amber-300
      border-amber-500/20
    `
  }

  return (

    <div
      className={`
        inline-flex
        px-3 py-1
        rounded-lg
        border
        text-xs
        font-medium

        ${
          styles[type] ||

          `
            bg-slate-800
            text-slate-300
            border-slate-700
          `
        }
      `}
    >

      {type}

    </div>

  )
}
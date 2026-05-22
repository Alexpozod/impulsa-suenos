"use client"

import {
  useEffect,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

export default function RaffleFraudPage() {

  const [loading, setLoading] =
    useState(true)

  const [orders, setOrders] =
    useState<any[]>([])

  async function load() {

    try {

      setLoading(true)

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          "/api/admin/raffles/fraud",
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setOrders(
        json?.orders || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {

    load()

  }, [])

  return (

    <div className="space-y-5">

      {/* HEADER */}

      <div>

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          🚨 Fraud Monitoring
        </h1>

        <p className="text-slate-400 mt-1">
          Monitoreo operacional y señales de riesgo
        </p>

      </div>

      {/* KPI */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        <MetricCard
          title="Orders"
          value={orders.length}
        />

        <MetricCard
          title="Medium Risk"
          value={
            orders.filter(

              order =>
                order.risk_level === "medium"

            ).length
          }
        />

        <MetricCard
          title="High Risk"
          value={
            orders.filter(

              order =>
                order.risk_level === "high"

            ).length
          }
        />

      </div>

      {/* TABLE */}

      <div
        className="
          bg-slate-900
          border border-slate-800
          rounded-xl
          overflow-hidden
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead
              className="
                bg-slate-950
                border-b border-slate-800
              "
            >

              <tr className="text-left">

                <th className="p-4">
                  Comprador
                </th>

                <th className="p-4">
                  Total
                </th>

                <th className="p-4">
                  Source
                </th>

                <th className="p-4">
                  IP
                </th>

                <th className="p-4">
                  Risk
                </th>

                <th className="p-4">
                  Flags
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
                orders.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    Sin señales de riesgo
                  </td>

                </tr>
              )}

              {!loading &&
                orders.map((order) => (

                <tr
                  key={order.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {order.buyer_name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {order.buyer_email}
                      </p>

                    </div>

                  </td>

                  <td className="p-4 font-semibold">

                    $
                    {Number(
                      order.total_clp || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    {order.source || "-"}

                  </td>

                  <td className="p-4 text-sm text-slate-400">

                    {order.ip_address || "-"}

                  </td>

                  <td className="p-4">

                    <RiskBadge
                      level={order.risk_level}
                    />

                  </td>

                  <td className="p-4">

                    <div
                      className="
                        flex flex-wrap
                        gap-2
                      "
                    >

                      {(order.risk_flags || [])
                        .map((flag: string) => (

                        <div
                          key={flag}
                          className="
                            px-2 py-1
                            rounded-lg
                            bg-red-900/30
                            text-red-300
                            text-xs
                            border border-red-500/20
                          "
                        >
                          {flag}
                        </div>

                      ))}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

function MetricCard({
  title,
  value
}: any) {

  return (

    <div
      className="
        bg-slate-900
        border border-slate-800
        rounded-xl
        p-4
      "
    >

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h3
        className="
          text-2xl
          font-bold
          mt-2
        "
      >
        {value}
      </h3>

    </div>
  )
}

function RiskBadge({
  level
}: any) {

  const colors: any = {

    low:
      "bg-green-900/30 text-green-300",

    medium:
      "bg-yellow-900/30 text-yellow-300",

    high:
      "bg-red-900/30 text-red-300"

  }

  return (

    <div
      className={`
        inline-flex
        px-3 py-1
        rounded-full
        text-xs
        border border-white/10

        ${colors[level]}
      `}
    >
      {level}
    </div>
  )
}
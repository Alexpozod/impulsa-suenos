"use client"

import {
  useEffect,
  useState
}
from "react"

import { supabase }
from "@/src/lib/supabase"

import PageHeader
from "@/app/components/raffles/admin/PageHeader"

import TableContainer
from "@/app/components/raffles/admin/TableContainer"

export default function
AdminRafflesSystemPage() {

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    health,
    setHealth
  ] = useState<any>(null)

  const [
    anomalies,
    setAnomalies
  ] = useState<any>(null)

  useEffect(() => {

  load()

  const interval = setInterval(
    () => {

      load()

    },
    30000
  )

  return () => {

    clearInterval(interval)

  }

}, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const headers = {

        Authorization:
          `Bearer ${session?.access_token}`

      }

      /* =========================
         HEALTH
      ========================= */

      const healthRes =
        await fetch(

          "/api/internal/raffles/system-health",

          {
            headers
          }
        )

      const healthJson =
        await healthRes.json()

      setHealth(
        healthJson
      )

      /* =========================
         ANOMALIES
      ========================= */

      const anomaliesRes =
        await fetch(

          "/api/internal/raffles/revenue-anomalies",

          {
            headers
          }
        )

      const anomaliesJson =
        await anomaliesRes.json()

      setAnomalies(
        anomaliesJson
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="space-y-6">

      <PageHeader
        title="🛡️ System Health"
        description="Monitoreo interno sorteos"
      />

      <div
  className="
    grid
    grid-cols-2
    md:grid-cols-4
    gap-3
  "
>

        <div
  className="
    rounded-xl
    border border-slate-800
    bg-slate-900
    p-4
  "
>

          <p className="text-xs text-slate-400">
            System Issues
          </p>

          <p
            className="
              text-2xl
              font-bold
              mt-2
            "
          >

            {
              health?.issues_found || 0
            }

          </p>

        </div>

        <div
          className="
            rounded-2xl
            border border-slate-800
            bg-slate-900
            p-6
          "
        >

          <p className="text-sm text-slate-400">
            Revenue Anomalies
          </p>

          <p
            className="
              text-2xl
              font-bold
              mt-2
            "
          >

            {
              anomalies?.anomalies_found || 0
            }

          </p>

        </div>

      </div>

      <TableContainer>

        <table className="w-full">

          <thead
            className="
              border-b border-slate-800
            "
          >

            <tr>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Severity
              </th>

              <th className="p-4 text-left">
                Reference
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={3}
                  className="
                    p-10
                    text-center
                  "
                >

                  Loading...

                </td>

              </tr>

            )}

            {!loading &&
              health?.issues?.map(
                (
                  issue: any,
                  index: number
                ) => (

                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-800
                  "
                >

                  <td className="p-4">

                    {issue.type}

                  </td>

                  <td className="p-4">

  <span
    className={`

      inline-flex
      items-center
      rounded-full
      px-2
      py-1
      text-xs
      font-medium

      ${

        issue.severity === "critical"

          ? "bg-red-100 text-red-700"

          : issue.severity === "high"

            ? "bg-orange-100 text-orange-700"

            : issue.severity === "medium"

              ? "bg-yellow-100 text-yellow-700"

              : "bg-slate-100 text-slate-700"

      }

    `}
  >

    {issue.severity}

  </span>

</td>

                  <td className="p-4 text-xs">

                    {issue.payment_id ||
                     issue.order_id ||
                     issue.ticket_id}

                  </td>

                </tr>

            ))}

          </tbody>

        </table>

      </TableContainer>

      <TableContainer>

        <table className="w-full">

          <thead
            className="
              border-b border-slate-800
            "
          >

            <tr>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Severity
              </th>

              <th className="p-4 text-left">
                Raffle
              </th>

            </tr>

          </thead>

          <tbody>

            {!loading &&
              anomalies?.anomalies?.map(
                (
                  anomaly: any,
                  index: number
                ) => (

                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-800
                  "
                >

                  <td className="p-4">

                    {anomaly.type}

                  </td>

                  <td className="p-4">

  <span
    className={`

      inline-flex
      items-center
      rounded-full
      px-2
      py-1
      text-xs
      font-medium

      ${

        anomaly.severity === "critical"

          ? "bg-red-100 text-red-700"

          : anomaly.severity === "high"

            ? "bg-orange-100 text-orange-700"

            : anomaly.severity === "medium"

              ? "bg-yellow-100 text-yellow-700"

              : "bg-slate-100 text-slate-700"

      }

    `}
  >

    {anomaly.severity}

  </span>

</td>

                  <td className="p-4 text-xs">

                    {anomaly.raffle_id}

                  </td>

                </tr>

            ))}

          </tbody>

        </table>

      </TableContainer>

    </div>
  )
}
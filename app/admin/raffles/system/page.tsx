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

  const [
  repairing,
  setRepairing
] = useState(false)

  const totalIssues =
  health?.issues_found || 0

const totalAnomalies =
  anomalies?.anomalies_found || 0

const healthScore =
  Math.max(
    0,
    100 -
    (
      totalIssues * 10 +
      totalAnomalies * 15
    )
  )

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

async function releaseReservations() {

  try {

    setRepairing(true)

    const {
      data: { session }
    } =
      await supabase.auth
        .getSession()

    await fetch(

      "/api/internal/raffles/release-reservations",

      {
        method: "POST",

        headers: {

          Authorization:
            `Bearer ${session?.access_token}`

        }
      }
    )

    await load()

  } catch (error) {

    console.error(
      "release reservations error",
      error
    )

  } finally {

    setRepairing(false)

  }

}

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
    flex
    items-center
    gap-3
  "
>

  <button
    onClick={
      releaseReservations
    }
    disabled={repairing}
    className="
      rounded-lg
      bg-orange-500
      px-4
      py-2
      text-sm
      font-medium
      text-white
      transition
      hover:bg-orange-600
      disabled:opacity-50
    "
  >

    {

      repairing

        ? "Liberando..."

        : "Liberar Reservas"

    }

  </button>

</div>

<div
  className="
    grid
    grid-cols-2
    md:grid-cols-4
    gap-3
  "
>

  {/* HEALTH SCORE */}

  <div
    className="
      rounded-xl
      border border-slate-800
      bg-slate-900
      p-4
    "
  >

    <p className="text-xs text-slate-400">
      Health Score
    </p>

    <p
      className="
        text-2xl
        font-bold
        mt-1
      "
    >

      {healthScore}%

    </p>

  </div>

  {/* SYSTEM ISSUES */}

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
        mt-1
      "
    >

      {
        totalIssues
      }

    </p>

  </div>

  {/* ANOMALIES */}

  <div
    className="
      rounded-xl
      border border-slate-800
      bg-slate-900
      p-4
    "
  >

    <p className="text-xs text-slate-400">
      Revenue Anomalies
    </p>

    <p
      className="
        text-2xl
        font-bold
        mt-1
      "
    >

      {
        totalAnomalies
      }

    </p>

  </div>

  {/* STATUS */}

  <div
    className="
      rounded-xl
      border border-slate-800
      bg-slate-900
      p-4
    "
  >

    <p className="text-xs text-slate-400">
      Status
    </p>

    <p
      className="
        text-lg
        font-semibold
        mt-2
      "
    >

      {

        healthScore >= 90

          ? "🟢 Healthy"

          : healthScore >= 70

            ? "🟡 Warning"

            : "🔴 Critical"

      }

    </p>

  </div>

</div>

{(
  totalIssues > 0 ||
  totalAnomalies > 0
) && (

  <div
    className="
      rounded-xl
      border
      border-red-300
      bg-red-50
      p-4
      text-sm
      text-red-700
    "
  >

    ⚠️ Se detectaron
    {" "}
    <strong>
      {totalIssues}
    </strong>
    {" "}
    issues y
    {" "}
    <strong>
      {totalAnomalies}
    </strong>
    {" "}
    anomalías activas.

  </div>

)}

<h2
  className="
    text-sm
    font-semibold
    text-slate-500
  "
>
  System Issues
</h2>

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

<div className="pt-2">

  <h2
    className="
      text-sm
      font-semibold
      text-slate-500
      mb-2
    "
  >
    Revenue Anomalies
  </h2>

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

</div>
  )
}
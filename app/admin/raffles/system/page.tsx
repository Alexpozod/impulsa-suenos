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

const [
  reconciling,
  setReconciling
] = useState(false)

const [
  cleaning,
  setCleaning
] = useState(false)

  const totalIssues =
  health?.issues_found || 0

const totalAnomalies =
  anomalies?.anomalies_found || 0

const criticalIssues =
  health?.issues?.filter(
    (issue:any) =>
      issue.severity === "critical"
  ).length || 0

const highIssues =
  health?.issues?.filter(
    (issue:any) =>
      issue.severity === "high"
  ).length || 0

const mediumIssues =
  health?.issues?.filter(
    (issue:any) =>
      issue.severity === "medium"
  ).length || 0

const lowIssues =
  health?.issues?.filter(
    (issue:any) =>
      issue.severity === "low"
  ).length || 0

const healthScore =
  Math.max(
    0,
    100 -
    (
      criticalIssues * 25 +
      highIssues * 10 +
      mediumIssues * 2 +
      lowIssues * 1 +
      totalAnomalies * 10
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

function isActionRunning() {

  return (
    repairing ||
    reconciling ||
    cleaning
  )

}

async function releaseReservations() {

if (
  isActionRunning()
) {

  return

}

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

async function reconcilePayments() {

if (
  isActionRunning()
) {

  return

}

  try {

    setReconciling(true)

    const {
      data: { session }
    } =
      await supabase.auth
        .getSession()

    await fetch(

      "/api/internal/raffles/reconcile-payments",

      {
        method: "GET",

        headers: {

          Authorization:
            `Bearer ${session?.access_token}`

        }
      }
    )

    await load()

  } catch (error) {

    console.error(
      "reconcile payments error",
      error
    )

  } finally {

    setReconciling(false)

  }

}

async function cleanupSystem() {

if (
  isActionRunning()
) {

  return

}

  try {

    setCleaning(true)

    const {
      data: { session }
    } =
      await supabase.auth
        .getSession()

    await fetch(

      "/api/internal/raffles/cleanup",

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
      "cleanup system error",
      error
    )

  } finally {

    setCleaning(false)

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

<button
  onClick={
    reconcilePayments
  }
  disabled={reconciling}
  className="
    rounded-lg
    bg-blue-600
    px-4
    py-2
    text-sm
    font-medium
    text-white
    transition
    hover:bg-blue-700
    disabled:opacity-50
  "
>

  {

    reconciling

      ? "Reconciliando..."

      : "Reconciliar Pagos"

  }

</button>

<button
  onClick={
    cleanupSystem
  }
  disabled={cleaning}
  className="
    rounded-lg
    bg-slate-700
    px-4
    py-2
    text-sm
    font-medium
    text-white
    transition
    hover:bg-slate-800
    disabled:opacity-50
  "
>

  {

    cleaning

      ? "Limpiando..."

      : "Cleanup"

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

? "🟢 Excelente"

: healthScore >= 75

? "🟡 Estable"

: healthScore >= 50

? "🟠 Revisar"

: "🔴 Crítico"

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

<div
  className="
    grid
    md:grid-cols-4
    gap-3
  "
>

  <div
    className="
      rounded-xl
      bg-slate-900
      border
      border-slate-800
      p-4
    "
  >

    <div className="text-xs text-slate-400">
      Critical
    </div>

    <div className="text-2xl font-bold">
      {criticalIssues}
    </div>

  </div>

  <div
    className="
      rounded-xl
      bg-slate-900
      border
      border-slate-800
      p-4
    "
  >

    <div className="text-xs text-slate-400">
      High
    </div>

    <div className="text-2xl font-bold">
      {highIssues}
    </div>

  </div>

  <div
    className="
      rounded-xl
      bg-slate-900
      border
      border-slate-800
      p-4
    "
  >

    <div className="text-xs text-slate-400">
      Medium
    </div>

    <div className="text-2xl font-bold">
      {mediumIssues}
    </div>

  </div>

  <div
    className="
      rounded-xl
      bg-slate-900
      border
      border-slate-800
      p-4
    "
  >

    <div className="text-xs text-slate-400">
      Low
    </div>

    <div className="text-2xl font-bold">
      {lowIssues}
    </div>

  </div>

</div>

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
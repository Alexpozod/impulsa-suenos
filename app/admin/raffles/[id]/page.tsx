"use client"

import {
  useEffect,
  useMemo,
  useState
}
from "react"

import {
  useParams
}
from "next/navigation"

import { supabase }
from "@/src/lib/supabase"

import MetricCard
from "@/app/components/raffles/admin/MetricCard"

import StatusBadge
from "@/app/components/raffles/admin/StatusBadge"

import TableContainer
from "@/app/components/raffles/admin/TableContainer"

import PageHeader
from "@/app/components/raffles/admin/PageHeader"

export default function AdminRaffleDetailPage() {

  const params =
    useParams()

  const raffleId =
    params.id as string

  const [loading, setLoading] =
    useState(true)

  const [tab, setTab] =
    useState("overview")

  const [data, setData] =
    useState<any>(null)

  useEffect(() => {

    if (!raffleId) return

    load()

  }, [raffleId])

  async function load() {

    try {

      setLoading(true)

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          `/api/admin/raffles/${raffleId}`,
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
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

  const metrics =
    data?.metrics || {}

  const raffle =
    data?.raffle || {}

  const orders =
    data?.orders || []

  const payments =
    data?.payments || []

  const tickets =
    data?.tickets || []

  const ledger =
    data?.ledger || []

  const fraud =
    data?.fraud || []

 const conversionRate =
  useMemo(() => {

    if (
      metrics.orders <= 0
    ) {
      return "0.00"
    }

    return (
      (
        metrics.payments /
        metrics.orders
      ) * 100
    ).toFixed(2)

  }, [metrics])

  if (loading) {

    return (

      <div className="p-6 text-white">
        Cargando...
      </div>

    )
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title={`🎟️ ${raffle.title || "Raffle"}`}
        description={raffle.slug}
      />

      {/* KPI */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-5
          gap-4
        "
      >

        <MetricCard
          title="Revenue"
          value={`$${Number(
            metrics.revenue || 0
          ).toLocaleString()}`}
        />

        <MetricCard
          title="Orders"
          value={metrics.orders || 0}
        />

        <MetricCard
          title="Payments"
          value={metrics.payments || 0}
        />

        <MetricCard
          title="Paid Tickets"
          value={metrics.paidTickets || 0}
        />

        <MetricCard
          title="Conversion"
          value={`${conversionRate}%`}
        />

      </div>

      {/* TABS */}

      <div
        className="
          flex flex-wrap
          gap-2
        "
      >

        <Tab
          active={tab === "overview"}
          onClick={() =>
            setTab("overview")
          }
        >
          Overview
        </Tab>

        <Tab
          active={tab === "orders"}
          onClick={() =>
            setTab("orders")
          }
        >
          Orders
        </Tab>

        <Tab
          active={tab === "payments"}
          onClick={() =>
            setTab("payments")
          }
        >
          Payments
        </Tab>

        <Tab
          active={tab === "tickets"}
          onClick={() =>
            setTab("tickets")
          }
        >
          Tickets
        </Tab>

        <Tab
          active={tab === "ledger"}
          onClick={() =>
            setTab("ledger")
          }
        >
          Ledger
        </Tab>

        <Tab
          active={tab === "fraud"}
          onClick={() =>
            setTab("fraud")
          }
        >
          Fraud
        </Tab>

      </div>

      {/* OVERVIEW */}

      {tab === "overview" && (

        <div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-5
    gap-4
  "
>

  <MetricCard
    title="Available"
    value={
      metrics.availableTickets || 0
    }
  />

  <MetricCard
    title="Reserved"
    value={
      metrics.reservedTickets || 0
    }
  />

  <MetricCard
    title="Fraud High"
    value={
      metrics.fraudHigh || 0
    }
  />

  <MetricCard
    title="Status"
    value={
      raffle.status || "-"
    }
  />

<MetricCard
  title="Gross Revenue"
  value={`$${Number(
    metrics.grossRevenue || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Provider Fees"
  value={`$${Number(
    metrics.providerFees || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Platform Fees"
  value={`$${Number(
    metrics.platformFees || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="IVA Fees"
  value={`$${Number(
    metrics.ivaFees || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Creator Net"
  value={`$${Number(
    metrics.creatorNet || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Platform Net"
  value={`$${Number(
    metrics.platformNet || 0
  ).toLocaleString()}`}
/>  

<MetricCard
  title="Visits"
  value={metrics.visits || 0}
/>

<MetricCard
  title="Begin Checkout"
  value={metrics.beginCheckout || 0}
/>

<MetricCard
  title="Payment Success"
  value={metrics.paymentSuccess || 0}
/>

<MetricCard
  title="Payment Failed"
  value={metrics.paymentFailed || 0}
/>

<MetricCard
  title="Revenue / Visit"
  value={`$${Number(
    metrics.revenuePerVisit || 0
  ).toFixed(0)}`}
/>

<MetricCard
  title="Creator Pending"
  value={`$${Number(
    metrics.creatorPending || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Creator Paid"
  value={`$${Number(
    metrics.creatorPaid || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Creator Available"
  value={`$${Number(
    metrics.creatorAvailable || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Platform Pending"
  value={`$${Number(
    metrics.platformPending || 0
  ).toLocaleString()}`}
/>

<MetricCard
  title="Payout Status"
  value={
    metrics.payoutStatus || "-"
  }
/>

</div>

      )}

      {/* ORDERS */}

      {tab === "orders" && (

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
                  Buyer
                </th>

                <th className="p-4 text-left">
                  Qty
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order: any) => (

                <tr
                  key={order.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">

                    <div>

                      <p>
                        {order.buyer_name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {order.buyer_email}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">
                    {order.quantity}
                  </td>

                  <td className="p-4">

                    $
                    {Number(
                      order.total_clp || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={order.status}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </TableContainer>

      )}

      {/* PAYMENTS */}

      {tab === "payments" && (

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
                  Provider
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Fee
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {payments.map((payment: any) => (

                <tr
                  key={payment.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">
                    {payment.provider}
                  </td>

                  <td className="p-4">

                    $
                    {Number(
                      payment.amount_clp || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    $
                    {Number(
                      payment.provider_fee || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={payment.status}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </TableContainer>

      )}

      {/* TICKETS */}

      {tab === "tickets" && (

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
                  Ticket
                </th>

                <th className="p-4 text-left">
                  Buyer
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {tickets.map((ticket: any) => (

                <tr
                  key={ticket.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">
                    {ticket.ticket_code}
                  </td>

                  <td className="p-4">
                    {ticket.buyer_email || "-"}
                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={ticket.status}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </TableContainer>

      )}

      {/* LEDGER */}

      {tab === "ledger" && (

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
                  Type
                </th>

                <th className="p-4 text-left">
                  Flow
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {ledger.map((item: any) => (

                <tr
                  key={item.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">
                    {item.type}
                  </td>

                  <td className="p-4">

                        <span
                            className={`
                            px-2 py-1
                            rounded-lg
                            text-xs
                            border

                            ${
                                item.flow_type === "in"

                                ? `
                                    bg-emerald-500/10
                                    border-emerald-500/20
                                    text-emerald-300
                                `

                                : `
                                    bg-red-500/10
                                    border-red-500/20
                                    text-red-300
                                `
                            }
                            `}
                        >

                            {item.flow_type}

                        </span>

                        </td>

                                        <td
                        className={`
                            p-4
                            font-semibold

                            ${
                            item.flow_type === "in"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                        `}
                        >

                        $
                        {Number(
                            item.amount_clp || 0
                        ).toLocaleString()}

                        </td>

                  <td className="p-4">

                    <StatusBadge
                      status={item.status}
                    />

                  </td>

                </tr>

              ))}

                        </tbody>

          </table>

          <div
            className="
              border-t
              border-slate-800
              p-5
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >

            <div
              className="
                bg-slate-950
                border border-slate-800
                rounded-xl
                p-4
              "
            >

              <p className="text-slate-400 text-sm">
                Gross Revenue
              </p>

              <p className="text-2xl font-bold text-emerald-400 mt-2">

                $
                {Number(
                  metrics.grossRevenue || 0
                ).toLocaleString()}

              </p>

            </div>

            <div
              className="
                bg-slate-950
                border border-slate-800
                rounded-xl
                p-4
              "
            >

              <p className="text-slate-400 text-sm">
                Creator Net
              </p>

              <p className="text-2xl font-bold text-blue-400 mt-2">

                $
                {Number(
                  metrics.creatorNet || 0
                ).toLocaleString()}

              </p>

            </div>

            <div
              className="
                bg-slate-950
                border border-slate-800
                rounded-xl
                p-4
              "
            >

              <p className="text-slate-400 text-sm">
                Platform Net
              </p>

              <p className="text-2xl font-bold text-purple-400 mt-2">

                $
                {Number(
                  metrics.platformNet || 0
                ).toLocaleString()}

              </p>

            </div>

          </div>

        </TableContainer>

      )}

      {/* FRAUD */}

      {tab === "fraud" && (

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
                  Buyer
                </th>

                <th className="p-4 text-left">
                  Risk
                </th>

                <th className="p-4 text-left">
                  Flags
                </th>

              </tr>

            </thead>

            <tbody>

              {fraud.map((item: any) => (

                <tr
                  key={item.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">

                    {item.buyer_email}

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={item.risk_level}
                    />

                  </td>

                  <td className="p-4">

                    <div className="flex gap-2 flex-wrap">

                      {(item.risk_flags || [])
                        .map((flag: string) => (

                        <div
                          key={flag}
                          className="
                            px-2 py-1
                            rounded-lg
                            text-xs
                            bg-red-900/30
                            border
                            border-red-500/20
                            text-red-300
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

        </TableContainer>

      )}

    </div>

  )
}

function Tab({
  children,
  active,
  onClick
}: any) {

  return (

    <button
      onClick={onClick}
      className={`
        px-4 py-2
        rounded-xl
        transition
        border

        ${
          active

            ? `
              bg-blue-600
              border-blue-500
              text-white
            `

            : `
              bg-slate-900
              border-slate-800
              text-slate-400
              hover:bg-slate-800
            `
        }
      `}
    >

      {children}

    </button>

  )
}
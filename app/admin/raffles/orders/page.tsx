"use client"

import {
  useEffect,
  useState
} from "react"

import Link from "next/link"

import { supabase }
from "@/src/lib/supabase"

export default function RaffleOrdersPage() {

  const [loading, setLoading] =
    useState(true)

  const [orders, setOrders] =
    useState<any[]>([])

  const [pagination, setPagination] =
    useState<any>(null)

  const [page, setPage] =
    useState(1)

  const [status, setStatus] =
    useState("")

  const [search, setSearch] =
    useState("")

  useEffect(() => {

    load()

  }, [page, status])

  async function load() {

    try {

      setLoading(true)

      const params =
        new URLSearchParams({

          page: String(page),

          limit: "20",

          status,

          search

        })

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          `/api/admin/raffles/orders?${params}`,
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

      setPagination(
        json?.pagination || null
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  const totalRevenue =
    orders.reduce(

      (sum, order) =>

        sum +
        Number(
          order.total_clp || 0
        ),

      0
    )

  return (

    <div className="space-y-5">

      {/* HEADER */}

      <div
        className="
          flex items-center
          justify-between
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
            "
          >
            📦 Orders
          </h1>

          <p className="text-slate-400 mt-1">
            Órdenes y compras de sorteos
          </p>

        </div>

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
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
        />

        <MetricCard
          title="Pending"
          value={
            orders.filter(

              order =>
                order.status === "pending"

            ).length
          }
        />

      </div>

      {/* FILTERS */}

      <div
        className="
          bg-slate-900
          border border-slate-800
          rounded-xl
          p-4
        "
      >

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Buscar comprador..."
            className="
              bg-slate-950
              border border-slate-700
              rounded-xl
              px-4 py-3
              outline-none
            "
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="
              bg-slate-950
              border border-slate-700
              rounded-xl
              px-4 py-3
              outline-none
            "
          >

            <option value="">
              Todos
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

          <button
            onClick={load}
            className="
              bg-blue-600
              hover:bg-blue-500
              transition
              rounded-xl
              font-medium
            "
          >
            Buscar
          </button>

        </div>

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
                  Sorteo
                </th>

                <th className="p-4">
                  Tickets
                </th>

                <th className="p-4">
                  Total
                </th>

                <th className="p-4">
                  Estado
                </th>

                <th className="p-4">
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
                    Sin órdenes
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

                  <td className="p-4">

                    <div>

                      <p className="font-medium">

                        {order.raffles?.title}

                      </p>

                      <p className="text-sm text-slate-500">

                        /{order.raffles?.slug}

                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    {order.quantity}

                  </td>

                  <td className="p-4 font-semibold">

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

                  <td className="p-4 text-sm text-slate-400">

                    {new Date(
                      order.created_at
                    ).toLocaleString()}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAGINATION */}

      {pagination && (

        <div
          className="
            flex items-center
            justify-between
          "
        >

          <p className="text-slate-500">

            Página {pagination.page}
            {" "}de{" "}
            {pagination.totalPages}

          </p>

          <div className="flex gap-2">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(page - 1)
              }
              className="
                px-4 py-2
                rounded-xl
                bg-slate-800
                disabled:opacity-40
              "
            >
              Anterior
            </button>

            <button
              disabled={
                page >= pagination.totalPages
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="
                px-4 py-2
                rounded-xl
                bg-slate-800
                disabled:opacity-40
              "
            >
              Siguiente
            </button>

          </div>

        </div>

      )}

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

function StatusBadge({
  status
}: any) {

  const colors: any = {

    pending:
      "bg-yellow-900/30 text-yellow-300",

    paid:
      "bg-green-900/30 text-green-300",

    cancelled:
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

        ${colors[status]}
      `}
    >
      {status}
    </div>
  )
}
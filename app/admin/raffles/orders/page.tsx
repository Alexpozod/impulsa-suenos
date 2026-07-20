"use client"

import {
  useEffect,
  useState
} from "react"

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

export default function RaffleOrdersPage() {

  const [loading, setLoading] =
    useState(true)

  const [orders, setOrders] =
    useState<any[]>([])

    const [pagination, setPagination] =
    useState<any>(null)

  const [stats, setStats] =
    useState({
      totalOrders: 0,
      confirmedRevenue: 0,
      paidOrders: 0,
      pendingOrders: 0
    })

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

      setStats(
        json?.stats || {
          totalOrders: 0,
          confirmedRevenue: 0,
          paidOrders: 0,
          pendingOrders: 0
        }
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }
  
  return (

    <div className="space-y-5">

      {/* HEADER */}

     <PageHeader
  title="📦 Orders"
  description="Órdenes y compras de sorteos"
/>

      {/* KPI */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
        "
      >

                <MetricCard
          title="Orders"
          value={
            stats.totalOrders
          }
        />

        <MetricCard
          title="Revenue"
          value={
            `$${Number(
              stats.confirmedRevenue || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <MetricCard
          title="Paid Orders"
          value={
            stats.paidOrders
          }
        />

        <MetricCard
          title="Pending"
          value={
            stats.pendingOrders
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
            md:grid-cols-4
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
            placeholder="
Buscar nombre, email o ID...
"
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
                        onChange={(e) => {

              setPage(1)

              setStatus(
                e.target.value
              )
            }}
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

                        <option value="expired">
              Expired
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

      <TableContainer>

          <table className="w-full">

            <thead
  className="
    bg-slate-950
    border-b
    border-slate-800
    sticky
    top-0
    z-10
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

                <th className="p-4">
  Acciones
</th>

              </tr>

            </thead>

            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan={7}
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
                    colSpan={7}
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
  border-b
  border-slate-800
  hover:bg-slate-900/50
  transition
"
                >

                  <td className="p-4">

                    <div>

                      <p
  className="
    font-semibold
    text-white
  "
>
  👤 {order.buyer_name}
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

<p
  className="
    text-xs
    text-slate-500
    mt-1
  "
>
  {order.status === "paid"
    ? "Pago confirmado"
    : order.status === "pending"
    ? "Pendiente"
    : "Cancelado"}
</p>

                  </td>

                  <td className="p-4 text-sm text-slate-400">

                    {new Date(
                      order.created_at
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                  <button
                    onClick={() => {

                      window.location.href =
                        `/admin/raffles/orders/${order.id}`

                    }}
                    className="
                      px-3 py-2
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-500
                      text-sm
                      transition
                    "
                  >
                    👁 Ver
                  </button>

              </td>

                </tr>

              ))}

            </tbody>

          </table>      

                </TableContainer>

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
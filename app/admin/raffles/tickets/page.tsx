"use client"

import {
  useEffect,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

export default function RaffleTicketsPage() {

  const [loading, setLoading] =
    useState(true)

  const [tickets, setTickets] =
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

          limit: "50",

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
          `/api/admin/raffles/tickets?${params}`,
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setTickets(
        json?.tickets || []
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
          🎟️ Tickets
        </h1>

        <p className="text-slate-400 mt-1">
          Inventario y estado de tickets
        </p>

      </div>

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
          title="Total"
          value={tickets.length}
        />

        <MetricCard
          title="Available"
          value={
            tickets.filter(

              ticket =>
                ticket.status === "available"

            ).length
          }
        />

        <MetricCard
          title="Reserved"
          value={
            tickets.filter(

              ticket =>
                ticket.status === "reserved"

            ).length
          }
        />

        <MetricCard
          title="Paid"
          value={
            tickets.filter(

              ticket =>
                ticket.status === "paid"

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
            placeholder="Buscar ticket o email..."
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

            <option value="available">
              Available
            </option>

            <option value="reserved">
              Reserved
            </option>

            <option value="paid">
              Paid
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
                  Ticket
                </th>

                <th className="p-4">
                  Sorteo
                </th>

                <th className="p-4">
                  Comprador
                </th>

                <th className="p-4">
                  Estado
                </th>

                <th className="p-4">
                  Reserva
                </th>

              </tr>

            </thead>

            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan={5}
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
                tickets.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    Sin tickets
                  </td>

                </tr>
              )}

              {!loading &&
                tickets.map((ticket) => (

                <tr
                  key={ticket.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {ticket.ticket_code}
                      </p>

                      <p className="text-sm text-slate-500">
                        #{ticket.ticket_number}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {ticket.raffles?.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        /{ticket.raffles?.slug}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    {ticket.buyer_email || "-"}

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={ticket.status}
                    />

                  </td>

                  <td className="p-4 text-sm text-slate-400">

                    {ticket.reserved_until
                      ? new Date(
                          ticket.reserved_until
                        ).toLocaleString()
                      : "-"}

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

    available:
      "bg-green-900/30 text-green-300",

    reserved:
      "bg-yellow-900/30 text-yellow-300",

    paid:
      "bg-blue-900/30 text-blue-300"

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
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { supabase }
from "@/src/lib/supabase"

export default function RafflesManagePage() {

  const [loading, setLoading] =
    useState(true)

  const [raffles, setRaffles] =
    useState<any[]>([])

  const [page, setPage] =
    useState(1)

  const [status, setStatus] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [pagination, setPagination] =
    useState<any>(null)

  useEffect(() => {

    load()

  }, [page, status])

  async function load() {

    try {

      setLoading(true)

      const params =
        new URLSearchParams({

          page: String(page),

          limit: "10",

          status,

          search

        })

      const {
        data: { session }
        } = await supabase.auth.getSession()

        console.log(
  "ADMIN SESSION",
  session
)

console.log(
  "ACCESS TOKEN",
  session?.access_token
)

        const res =
        await fetch(
            `/api/admin/raffles/list?${params}`,
            {
            headers: {
                Authorization:
                `Bearer ${session?.access_token}`
            }
            }
        )

      const json =
        await res.json()

        console.log(
  "RAFFLES API RESPONSE",
  json
)

      setRaffles(
        json?.raffles || []
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

  async function action(
  endpoint: string,
  raffle_id: string
) {

  try {

    const confirmed =
      window.confirm(
        "¿Confirmar acción?"
      )

    if (!confirmed) {
      return
    }

    const {
      data: { session }
    } = await supabase.auth.getSession()

    const res =
      await fetch(endpoint, {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${session?.access_token}`
        },

        body: JSON.stringify({
          raffle_id
        })

      })

    if (!res.ok) {

      const json =
        await res.json()

      alert(
        json?.error ||
        "Error"
      )

      return
    }

    await load()

  } catch (error) {

    console.error(error)

    alert("Error inesperado")

  }

}

async function exportExcel(
  raffle_id: string
) {

  try {

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const res =
      await fetch(
        "/api/admin/raffles/export-excel",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session?.access_token}`

          },

          body: JSON.stringify({
            raffle_id
          })

        }
      )

    if (!res.ok) {

      const json =
        await res.json()

      alert(
        json?.error ||
        "Export failed"
      )

      return
    }

    const blob =
      await res.blob()

    const url =
      window.URL.createObjectURL(blob)

    const a =
      document.createElement("a")

    a.href = url

    a.download =
      "raffle-export.xlsx"

    a.click()

    window.URL.revokeObjectURL(url)

  } catch (error) {

    console.error(error)

    alert("Export failed")

  }

}
 
  const totalRevenue =
    raffles.reduce(

      (sum, raffle) =>

        sum +
        Number(
          raffle.revenue || 0
        ),

      0
    )

  const activeRaffles =
    raffles.filter(

      raffle =>
        raffle.status === "active"

    ).length

  const soldTickets =
    raffles.reduce(

      (sum, raffle) =>

        sum +
        Number(
          raffle.sold_ticket_count || 0
        ),

      0
    )

  const reservedTickets =
    raffles.reduce(

      (sum, raffle) =>

        sum +
        Number(
          raffle.reserved_ticket_count || 0
        ),

      0
    )

  return (

    <div className="space-y-6">

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
            🎟️ Gestión de Sorteos
          </h1>

          <p className="text-slate-400 mt-1">
            Administración completa del sistema de sorteos
          </p>

        </div>

        <Link
          href="/admin/raffles/create"
          className="
            bg-white
            text-slate-900
            hover:bg-slate-200
            transition
            px-5 py-3
            rounded-2xl
            font-medium
          "
        >
          ➕ Crear Sorteo
        </Link>

      </div>

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
          value={`$${totalRevenue.toLocaleString()}`}
        />

        <MetricCard
          title="Active"
          value={activeRaffles}
        />

        <MetricCard
          title="Sold Tickets"
          value={soldTickets}
        />

        <MetricCard
          title="Reserved"
          value={reservedTickets}
        />

      </div>

      {/* FILTERS */}

      <div
        className="
          bg-slate-900
          border border-slate-800
          rounded-3xl
          p-5
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
            placeholder="Buscar..."
            className="
              bg-slate-950
              border border-slate-700
              rounded-2xl
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
              rounded-2xl
              px-4 py-3
              outline-none
            "
          >

            <option value="">
              Todos
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="active">
              Active
            </option>

            <option value="paused">
              Paused
            </option>

            <option value="ended">
              Ended
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
              rounded-2xl
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
          rounded-3xl
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
                  Sorteo
                </th>

                <th className="p-4">
                  Estado
                </th>

                <th className="p-4">
                  Precio
                </th>

                <th className="p-4">
                  Vendidos
                </th>

                <th className="p-4">
                  Reservados
                </th>

                <th className="p-4">
                  Revenue
                </th>

                <th className="p-4">
                  Cierre
                </th>

                <th className="p-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan={8}
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
                raffles.length === 0 && (

                <tr>

                  <td
                    colSpan={8}
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    Sin sorteos
                  </td>

                </tr>
              )}

              {!loading &&
                raffles.map((raffle) => (

                <tr
  key={raffle.id}
  className="
    border-b
    border-slate-800
    hover:bg-slate-800/40
    transition
  "
>

                  <td className="p-4">

                    <div>

                      <p
  className="
    font-semibold
    max-w-[420px]
    truncate
  "
>
  {raffle.title}
</p>
                      
                    </div>

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={raffle.status}
                    />

                  </td>

                  <td className="p-4">

                    $
                    {Number(
                      raffle.ticket_price_clp || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    {Number(
                      raffle.sold_ticket_count || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    {Number(
                      raffle.reserved_ticket_count || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4 font-semibold">

                    $
                    {Number(
                      raffle.revenue || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    {raffle.end_date
                      ? new Date(
                          raffle.end_date
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  <td className="p-4">

                    <div
  className="
    flex
    items-center
    gap-1
    whitespace-nowrap
  "
>

                      {(raffle.status === "draft" ||
                        raffle.status === "scheduled") && (

                        <ActionButton
                          label="Publish"
                          color="green"
                          onClick={() =>
                            action(
                              "/api/admin/raffles/publish",
                              raffle.id
                            )
                          }
                        />

                      )}

                      {raffle.status === "active" && (

                        <>

                          <ActionButton
                            label="⏸"
                            color="yellow"
                            onClick={() =>
                              action(
                                "/api/admin/raffles/pause",
                                raffle.id
                              )
                            }
                          />

                          <ActionButton
                            label="⛔"
                            color="red"
                            onClick={() =>
                              action(
                                "/api/admin/raffles/end",
                                raffle.id
                              )
                            }
                          />

                        </>

                      )}

                      {raffle.status === "paused" && (

  <>

    <ActionButton
      label="▶"
      color="green"
      onClick={() =>
        action(
          "/api/admin/raffles/resume",
          raffle.id
        )
      }
    />

    <ActionButton
      label="End"
      color="red"
      onClick={() =>
        action(
          "/api/admin/raffles/end",
          raffle.id
        )
      }
    />

  </>

)}

                      {(raffle.status === "ended" ||
  raffle.status === "completed") && (

  <>

    <Link
      href={`/admin/raffles/results/${raffle.id}`}
      className="
        px-3 py-2
        rounded-xl
        bg-emerald-600
        hover:bg-emerald-500
        text-sm
      "
    >
      Resultados
    </Link>

    <ActionButton
      label="📊"
      color="blue"
      onClick={() =>
        exportExcel(
          raffle.id
        )
      }
    />

  </>

)}

<Link
  href={`/admin/raffles/edit/${raffle.id}`}
  className="
    px-3 py-2
    rounded-xl
    bg-blue-600
    hover:bg-blue-500
    text-sm
  "
>
  ✏️
</Link>

<ActionButton
  label="🗑"
  color="red"
  onClick={() =>
    action(
      "/api/admin/raffles/delete",
      raffle.id
    )
  }
/>

                      <Link
                        href={`/raffles/${raffle.slug}`}
                        target="_blank"
                        className="
                          px-3 py-2
                          rounded-xl
                          bg-slate-800
                          hover:bg-slate-700
                          text-sm
                        "
                      >
                        👁️
                      </Link>

                    </div>

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
        bg-gradient-to-br
        from-slate-900
        to-slate-950
        border border-slate-800
        rounded-2xl
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

    draft:
      "bg-slate-700 text-slate-200",

    scheduled:
      "bg-blue-900/40 text-blue-300",

    active:
      "bg-green-900/40 text-green-300",

    paused:
      "bg-yellow-900/40 text-yellow-300",

    ended:
      "bg-red-900/40 text-red-300",

      cancelled:
    "bg-slate-700 text-slate-300",

    completed:
      "bg-purple-900/40 text-purple-300"

  }

  return (

    <div
      className={`
        inline-flex
        px-3 py-1
        rounded-full
        text-xs
        font-medium
        border border-white/10

        ${colors[status]}
      `}
    >
      {status}
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  color
}: any) {

  const colors: any = {

  green:
    `
    bg-emerald-600
    hover:bg-emerald-500
    text-white
    `,

  yellow:
    `
    bg-amber-500
    hover:bg-amber-400
    text-slate-950
    font-bold
    `,

  red:
    `
    bg-red-600
    hover:bg-red-500
    text-white
    `,

  blue:
    `
    bg-blue-600
    hover:bg-blue-500
    text-white
    `

}

  return (

    <button
      onClick={onClick}
      className={`
  min-w-[34px]
  h-[34px]

  flex
  items-center
  justify-center

  rounded-xl

  text-sm
  transition

  ${colors[color]}
`}
    >
      {label}
    </button>
  )
}
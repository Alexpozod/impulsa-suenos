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

          <p className="text-[#002314] mt-1">
            Administración completa del sistema de sorteos
          </p>

        </div>

        <Link
          href="/admin/raffles/create"
          className="
            bg-white
            text-[#002314]
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
          bg-[#EDE8FD]
          border border-[#002314]/20
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
              bg-[#FAF9F5]
              border border-[#002314]/20
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
              bg-[#FAF9F5]
              border border-[#002314]/20
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
              bg-[#7048E8] text-white
              hover:bg-[#002314]
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
          bg-[#EDE8FD]
          border border-[#002314]/20
          rounded-3xl
          overflow-hidden
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead
              className="
                bg-[#FAF9F5]
                border-b border-[#002314]/20
              "
            >

              <tr className="text-left">

                <th className="p-4 w-[380px]">
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

                <th className="p-4 w-[240px]">
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
                      text-[#002314]
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
                      text-[#002314]
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
    border-[#002314]/20
    hover:bg-[#EDE8FD]/40
    transition
  "
>

                  <td className="p-4">

                    <div>

                      <p
  className="
    font-semibold
    max-w-[380px]
    line-clamp-2
    leading-5
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
    flex-wrap
    gap-1
    max-w-[220px]
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
  label="Pause"
                            color="yellow"
                            onClick={() =>
                              action(
                                "/api/admin/raffles/pause",
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

                      {raffle.status === "paused" && (

  <>

    <ActionButton
      label="Resume"
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
    bg-emerald-500
    hover:bg-emerald-400
    text-white
    font-semibold
    text-sm
  "
>
  Resultados
</Link>

   <ActionButton
  label="Export"
  color="purple"
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
    bg-[#7048E8] text-white
    hover:bg-[#002314]
    text-white
    text-sm
    font-medium
  "
>
  Editar
</Link>

<ActionButton
  label="Eliminar"
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
                          bg-[#EDE8FD]
                          hover:bg-[#EDE8FD]
                          text-sm
                        "
                      >
  Ver
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

          <p className="text-[#002314]">

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
                bg-[#EDE8FD]
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
                bg-[#EDE8FD]
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
        from-[#EDE8FD]
        to-[#FAF9F5]
        border border-[#002314]/20
        rounded-2xl
p-4
      "
    >

      <p className="text-[#002314] text-sm">
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
      "bg-[#EDE8FD] text-[#002314]",

    scheduled:
      "bg-blue-100/40 text-[#7048E8]",

    active:
      "bg-green-100/40 text-green-800",

    paused:
      "bg-yellow-100/40 text-yellow-800",

    ended:
      "bg-red-100/40 text-red-800",

      cancelled:
    "bg-[#EDE8FD] text-[#002314]",

    completed:
      "bg-purple-100/40 text-[#7048E8]"

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
    text-[#002314]
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
    bg-[#7048E8] text-white
    hover:bg-[#002314]
    text-white
    `,

    purple:
`
bg-[#7048E8] text-white
hover:bg-[#002314]
text-white
font-medium
`,

}

  return (

    <button
      onClick={onClick}
      className={`
  px-3
py-2
 
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
"use client"

import {
  useEffect,
  useState
}
from "react"

import { supabase }
from "@/src/lib/supabase"

export default function RaffleExportsPage() {

  const [loading, setLoading] =
    useState(true)

  const [raffles, setRaffles] =
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
          "/api/admin/raffles/list?page=1&limit=100&status=ended",
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setRaffles(
        json?.raffles || []
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

  async function exportJson(
    raffle_id: string
  ) {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          "/api/admin/raffles/export",
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

      const json =
        await res.json()

      if (!res.ok) {

        alert(
          json?.error ||
          "Export failed"
        )

        return
      }

      const blob =
        new Blob(
          [
            JSON.stringify(
              json,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        )

      const url =
        window.URL.createObjectURL(blob)

      const a =
        document.createElement("a")

      a.href = url

      a.download =
        "raffle-export.json"

      a.click()

      window.URL.revokeObjectURL(url)

    } catch (error) {

      console.error(error)

      alert("Export failed")
    }
  }

  async function exportExcel(
    raffle_id: string
  ) {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

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
          📤 Exports
        </h1>

        <p className="text-slate-400 mt-1">
          Exports oficiales y auditoría
        </p>

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
                  Sorteo
                </th>

                <th className="p-4">
                  Estado
                </th>

                <th className="p-4">
                  Revenue
                </th>

                <th className="p-4">
                  Tickets
                </th>

                <th className="p-4">
                  Export
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
                raffles.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    Sin sorteos finalizados
                  </td>

                </tr>
              )}

              {!loading &&
                raffles.map((raffle) => (

                <tr
                  key={raffle.id}
                  className="
                    border-b border-slate-800
                  "
                >

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {raffle.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        /{raffle.slug}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={raffle.status}
                    />

                  </td>

                  <td className="p-4 font-semibold">

                    $
                    {Number(
                      raffle.revenue || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    {Number(
                      raffle.sold_ticket_count || 0
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    <div
                      className="
                        flex gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          exportJson(
                            raffle.id
                          )
                        }
                        className="
                          px-3 py-2
                          rounded-xl
                          bg-slate-800
                          hover:bg-slate-700
                          text-sm
                        "
                      >
                        JSON
                      </button>

                      <button
                        onClick={() =>
                          exportExcel(
                            raffle.id
                          )
                        }
                        className="
                          px-3 py-2
                          rounded-xl
                          bg-blue-600
                          hover:bg-blue-500
                          text-sm
                        "
                      >
                        Excel
                      </button>

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

function StatusBadge({
  status
}: any) {

  return (

    <div
      className="
        inline-flex
        px-3 py-1
        rounded-full
        text-xs
        border border-white/10
        bg-red-900/30
        text-red-300
      "
    >
      {status}
    </div>
  )
}
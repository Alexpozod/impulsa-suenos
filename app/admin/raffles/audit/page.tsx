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
AdminRafflesAuditPage() {

  const [
    logs,
    setLogs
  ] = useState<any[]>([])

  const [
    loading,
    setLoading
  ] = useState(true)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(

          "/api/admin/raffles/audit",

          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setLogs(
        json.logs || []
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
        title="📜 Audit Logs"
        description="Acciones administrativas internas"
      />

      <TableContainer>

        <table className="w-full">

          <thead
            className="
              border-b border-slate-800
            "
          >

            <tr>

              <th className="p-3 text-left text-xs">
                Action
              </th>

              <th className="p-3 text-left text-xs">
                Entity
              </th>

              <th className="p-3 text-left text-xs">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={3}
                  className="
                    p-8
                    text-center
                    text-sm
                  "
                >

                  Loading...

                </td>

              </tr>

            )}

            {!loading &&
              logs.map(
                (
                  log,
                  index
                ) => (

                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-800
                  "
                >

                  <td className="p-3 text-sm">

                    {log.action}

                  </td>

                  <td className="p-3 text-xs">

                    {log.entity_type}

                  </td>

                  <td className="p-3 text-xs">

                    {
                      new Date(
                        log.created_at
                      ).toLocaleString()
                    }

                  </td>

                </tr>

            ))}

          </tbody>

        </table>

      </TableContainer>

    </div>
  )
}
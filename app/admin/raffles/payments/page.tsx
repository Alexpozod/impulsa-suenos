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

export default function RafflePaymentsPage() {

  const [loading, setLoading] =
    useState(true)

  const [payments, setPayments] =
    useState<any[]>([])

    const [pagination, setPagination] =
    useState<any>(null)

  const [stats, setStats] =
    useState({
      totalPayments: 0,
      approvedRevenue: 0,
      approvedPayments: 0,
      failedPayments: 0
    })

  const [page, setPage] =
    useState(1)

  const [status, setStatus] =
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

          status

        })

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          `/api/admin/raffles/payments?${params}`,
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setPayments(
        json?.payments || []
      )

            setPagination(
        json?.pagination || null
      )

      setStats(
        json?.stats || {
          totalPayments: 0,
          approvedRevenue: 0,
          approvedPayments: 0,
          failedPayments: 0
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

      <PageHeader
  title="💳 Payments"
  description="Pagos y transacciones Flow"
/>

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
          title="Payments"
          value={
            stats.totalPayments
          }
        />

        <MetricCard
          title="Revenue"
          value={
            `$${Number(
              stats.approvedRevenue || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <MetricCard
          title="Approved"
          value={
            stats.approvedPayments
          }
        />

        <MetricCard
          title="Failed"
          value={
            stats.failedPayments
          }
        />

      </div>

      {/* FILTERS */}

      <div
        className="
          bg-[#EDE8FD]
          border border-[#002314]/20
          rounded-xl
          p-4
        "
      >

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >

          <select
            value={status}
                        onChange={(e) => {

              setPage(1)

              setStatus(
                e.target.value
              )
            }}
            className="
              bg-[#FAF9F5]
              border border-[#002314]/20
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

                        <option value="approved">
              Approved
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>

          </select>

          <button
            onClick={load}
            className="
              bg-[#7048E8] text-white
              hover:bg-[#002314]
              transition
              rounded-xl
              font-medium
            "
          >
            Filtrar
          </button>

        </div>

      </div>

      {/* TABLE */}

        <TableContainer>

          <table className="w-full">

            <thead
  className="
    sticky
    top-0
    z-10
    bg-[#FAF9F5]
    border-b
    border-[#002314]/20
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
                  Provider
                </th>

                <th className="p-4">
                  Monto
                </th>

                <th className="p-4">
                  Fee
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
                payments.length === 0 && (

                <tr>

                  <td
                    colSpan={8}
                    className="
                      p-10
                      text-center
                      text-[#002314]
                    "
                  >
                    Sin pagos
                  </td>

                </tr>
              )}

              {!loading &&
                payments.map((payment) => (

                <tr
                  key={payment.id}
                 className="
  border-b
  border-[#002314]/20
  hover:bg-[#EDE8FD]/40
  transition
"
                >

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {payment.orders?.buyer_name}
                      </p>

                      <p className="text-sm text-[#002314]">
                        {payment.orders?.buyer_email}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {payment.raffles?.title}
                      </p>

                      <p className="text-sm text-[#002314]">
                        /{payment.raffles?.slug}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

  <div className="space-y-2">

    <span
      className="
        inline-flex
        px-2 py-1
        rounded-full
        bg-cyan-100/40
        text-[#7048E8]
        text-xs
        font-medium
      "
    >
      {payment.provider}
    </span>

    <p className="text-xs text-[#002314]">

      {String(
        payment.provider_payment_id || ""
      ).slice(0, 16)}...

    </p>

  </div>

</td>

                  <td className="p-4 font-semibold">

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

                  <td className="p-4 text-sm text-[#002314]">

  {new Date(
    payment.created_at
  ).toLocaleString()}

</td>

<td className="p-4">

  <button
    onClick={() => {

      window.location.href =
        `/admin/raffles/payments/${payment.id}`

    }}
    className="
      px-3
      py-2
      rounded-xl
      bg-[#7048E8] text-white
      hover:bg-[#002314]
      transition
      text-sm
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
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

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  const totalRevenue =
    payments.reduce(

      (sum, payment) =>

        sum +
        Number(
          payment.amount_clp || 0
        ),

      0
    )

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
          value={payments.length}
        />

        <MetricCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
        />

        <MetricCard
  title="Approved"
  value={
    payments.filter(
      payment =>
        payment.status === "approved" ||
        payment.status === "paid"
    ).length
  }
/>

<MetricCard
  title="Failed"
  value={
    payments.filter(
      payment =>
        payment.status === "failed"
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
            md:grid-cols-2
            gap-4
          "
        >

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

            <option value="failed">
              Failed
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
    bg-slate-950
    border-b
    border-slate-800
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
                      text-slate-500
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
                      text-slate-500
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
  border-slate-800
  hover:bg-slate-900/40
  transition
"
                >

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {payment.orders?.buyer_name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {payment.orders?.buyer_email}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {payment.raffles?.title}
                      </p>

                      <p className="text-sm text-slate-500">
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
        bg-cyan-900/40
        text-cyan-300
        text-xs
        font-medium
      "
    >
      {payment.provider}
    </span>

    <p className="text-xs text-slate-500">

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

                  <td className="p-4 text-sm text-slate-400">

  {new Date(
    payment.created_at
  ).toLocaleString()}

</td>

<td className="p-4">

  <button
    onClick={async () => {

      try {

        const {
          data: { session }
        } =
          await supabase.auth.getSession()

        const res =
          await fetch(
            `/api/admin/raffles/payments/${payment.id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${session?.access_token}`
              }
            }
          )

        const json =
          await res.json()

        const p =
          json.payment

        const tickets =
          p.tickets
            ?.map(
              (ticket: any) =>
                ticket.ticket_code
            )
            .join("\n") ||
          "Sin tickets"

        alert(
          [

            "PAGO",
            "",

            `ID: ${p.id}`,

            `Order ID: ${p.order_id}`,

            `Estado: ${p.status}`,

            `Monto: $${Number(
              p.amount_clp || 0
            ).toLocaleString()}`,

            `Fee: $${Number(
              p.provider_fee || 0
            ).toLocaleString()}`,

            `Provider: ${p.provider}`,

            `Provider Payment ID: ${p.provider_payment_id}`,

            "",

            "CLIENTE",
            "",

            `${p.orders?.buyer_name || "-"}`,

            `${p.orders?.buyer_email || "-"}`,

            "",

            "EMAIL",
            "",

            `Enviado: ${
              p.orders?.confirmation_email_sent
                ? "SI"
                : "NO"
            }`,

            `Fecha: ${
              p.orders?.confirmation_email_sent_at ||
              "-"
            }`,

            "",

            "TICKETS",
            "",

            tickets

          ].join("\n")
        )

      } catch (error) {

        console.error(error)

        alert(
          "Error cargando detalle"
        )

      }

    }}
    className="
      px-3
      py-2
      rounded-xl
      bg-blue-600
      hover:bg-blue-500
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
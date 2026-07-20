"use client"

import {
  useEffect,
  useState
} from "react"

import {
  useParams
} from "next/navigation"

import { supabase }
from "@/src/lib/supabase"

export default function OrderDetailPage() {

  const params =
    useParams()

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [order, setOrder] =
    useState<any>(null)

  const [payments, setPayments] =
    useState<any[]>([])

  const [tickets, setTickets] =
    useState<any[]>([])

  const [ledger, setLedger] =
    useState<any[]>([])

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      setLoading(true)
      setError("")

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          `/api/admin/raffles/orders/${params.id}`,
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      if (!res.ok) {

        throw new Error(
          json?.error ||
          "order_detail_failed"
        )
      }

      setOrder(
        json?.order || null
      )

      setPayments(
        json?.payments || []
      )

      setTickets(
        json?.tickets || []
      )

      setLedger(
        json?.ledger || []
      )

    } catch (error: any) {

      console.error(error)

      setError(
        error?.message ||
        "No fue posible cargar la orden"
      )

    } finally {

      setLoading(false)
    }
  }

  if (loading) {

    return (

      <div className="p-6">

        Cargando detalle de la orden...

      </div>
    )
  }

  if (
    error ||
    !order
  ) {

    return (

      <div className="space-y-4">

        <button
          onClick={() => {

            window.location.href =
              "/admin/raffles/orders"

          }}
          className="
            px-4 py-2
            rounded-xl
            bg-slate-800
            hover:bg-slate-700
            transition
          "
        >
          ← Volver
        </button>

        <div
          className="
            p-6
            rounded-2xl
            border
            border-red-900
            bg-red-950/30
            text-red-300
          "
        >
          {error || "Orden no encontrada"}
        </div>

      </div>
    )
  }

  const approvedPayment =
    payments.find(
      payment =>
        payment.status === "approved"
    )

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
            "
          >
            📦 Order Detail
          </h1>

          <p className="text-slate-400 mt-2">

            Auditoría completa de orden,
            pago, tickets y ledger

          </p>

        </div>

        <button
          onClick={() => {

            window.location.href =
              "/admin/raffles/orders"

          }}
          className="
            px-4 py-2
            rounded-xl
            bg-slate-800
            hover:bg-slate-700
            transition
          "
        >
          ← Volver a Orders
        </button>

      </div>

      {/* RESUMEN */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
        "
      >

        <Card
          title="Total"
          value={
            `$${Number(
              order.total_clp || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <Card
          title="Estado orden"
          value={
            String(
              order.status || "-"
            )
          }
        />

        <Card
          title="Tickets solicitados"
          value={
            String(
              order.quantity || 0
            )
          }
        />

        <Card
          title="Tickets asociados"
          value={
            String(
              tickets.length
            )
          }
        />

      </div>

      {/* ORDEN */}

      <Section title="Orden">

        <Info
          label="Order ID"
          value={order.id}
        />

        <Info
          label="Estado"
          value={order.status}
        />

        <Info
          label="Cantidad"
          value={order.quantity}
        />

        <Info
          label="Subtotal CLP"
          value={
            `$${Number(
              order.subtotal_clp || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <Info
          label="Total CLP"
          value={
            `$${Number(
              order.total_clp || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <Info
          label="Moneda"
          value={
            order.currency || "CLP"
          }
        />

        <Info
          label="Creada"
          value={
            formatDate(
              order.created_at
            )
          }
        />

        <Info
          label="Actualizada"
          value={
            formatDate(
              order.updated_at
            )
          }
        />

      </Section>

      {/* COMPRADOR */}

      <Section title="Comprador">

        <Info
          label="Nombre"
          value={order.buyer_name}
        />

        <Info
          label="Email"
          value={order.buyer_email}
        />

        <Info
          label="Teléfono"
          value={order.buyer_phone}
        />

        <Info
          label="User ID"
          value={order.user_id}
        />

        <Info
          label="IP"
          value={order.ip_address}
        />

        <Info
          label="User Agent"
          value={order.user_agent}
        />

      </Section>

      {/* SORTEO */}

      <Section title="Sorteo">

        <Info
          label="Raffle ID"
          value={order.raffle_id}
        />

        <Info
          label="Título"
          value={order.raffles?.title}
        />

        <Info
          label="Slug"
          value={order.raffles?.slug}
        />

        <Info
          label="Estado"
          value={order.raffles?.status}
        />

        <Info
          label="Precio ticket"
          value={
            `$${Number(
              order.raffles
                ?.ticket_price_clp || 0
            ).toLocaleString("es-CL")}`
          }
        />

        <Info
          label="Inicio"
          value={
            formatDate(
              order.raffles?.start_date
            )
          }
        />

        <Info
          label="Término"
          value={
            formatDate(
              order.raffles?.end_date
            )
          }
        />

        <Info
          label="Sorteo"
          value={
            formatDate(
              order.raffles?.draw_date
            )
          }
        />

      </Section>

      {/* ORIGEN */}

      <Section title="Origen y atribución">

        <Info
          label="Source"
          value={order.source}
        />

        <Info
          label="Referrer"
          value={order.referrer}
        />

        <Info
          label="UTM Source"
          value={order.utm_source}
        />

        <Info
          label="UTM Medium"
          value={order.utm_medium}
        />

        <Info
          label="UTM Campaign"
          value={order.utm_campaign}
        />

        <Info
          label="UTM Content"
          value={order.utm_content}
        />

        <Info
          label="UTM Term"
          value={order.utm_term}
        />

      </Section>

      {/* PAGOS */}

      <Section title="Pagos asociados">

        {payments.length === 0 ? (

          <EmptyText
            value="No existen pagos asociados"
          />

        ) : (

          <div className="space-y-3">

            {payments.map(
              payment => (

                <div
                  key={payment.id}
                  className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950
                    p-4
                  "
                >

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      xl:grid-cols-4
                      gap-3
                    "
                  >

                    <Info
                      label="Payment ID"
                      value={payment.id}
                    />

                    <Info
                      label="Provider"
                      value={payment.provider}
                    />

                    <Info
                      label="Provider ID"
                      value={
                        payment.provider_payment_id
                      }
                    />

                    <Info
                      label="Estado"
                      value={payment.status}
                    />

                    <Info
                      label="Monto"
                      value={
                        `$${Number(
                          payment.amount_clp || 0
                        ).toLocaleString("es-CL")}`
                      }
                    />

                    <Info
                      label="Fee provider"
                      value={
                        `$${Number(
                          payment.provider_fee || 0
                        ).toLocaleString("es-CL")}`
                      }
                    />

                    <Info
                      label="Creado"
                      value={
                        formatDate(
                          payment.created_at
                        )
                      }
                    />

                    <button
                      onClick={() => {

                        window.location.href =
                          `/admin/raffles/payments/${payment.id}`

                      }}
                      className="
                        self-end
                        px-3 py-2
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-500
                        transition
                        text-sm
                      "
                    >
                      Ver pago completo
                    </button>

                  </div>

                </div>

              )
            )}

          </div>
        )}

        {approvedPayment && (

          <p
            className="
              mt-4
              text-sm
              text-green-300
            "
          >
            Existe un pago aprobado asociado
            a esta orden.
          </p>
        )}

      </Section>

      {/* TICKETS */}

      <Section title="Tickets asociados">

        {tickets.length === 0 ? (

          <EmptyText
            value="No existen tickets asociados"
          />

        ) : (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-3
            "
          >

            {tickets.map(
              ticket => (

                <div
                  key={ticket.id}
                  className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950
                    p-4
                  "
                >

                  <p className="font-semibold">

                    {ticket.ticket_code}

                  </p>

                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-1
                    "
                  >
                    Número:
                    {" "}
                    {ticket.ticket_number}
                  </p>

                  <p
                    className="
                      text-sm
                      text-slate-400
                      mt-1
                    "
                  >
                    Estado:
                    {" "}
                    {ticket.status}
                  </p>

                  <button
                    onClick={() => {

                      window.location.href =
                        `/admin/raffles/tickets/${ticket.id}`

                    }}
                    className="
                      mt-4
                      px-3 py-2
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-500
                      transition
                      text-sm
                    "
                  >
                    Ver ticket
                  </button>

                </div>

              )
            )}

          </div>
        )}

      </Section>

      {/* LEDGER */}

      <Section title="Movimientos del ledger">

        {ledger.length === 0 ? (

          <EmptyText
            value="No existen movimientos asociados"
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr
                  className="
                    text-left
                    border-b
                    border-slate-800
                  "
                >

                  <th className="p-3">
                    Tipo
                  </th>

                  <th className="p-3">
                    Flujo
                  </th>

                  <th className="p-3">
                    Monto
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3">
                    Descripción
                  </th>

                  <th className="p-3">
                    Fecha
                  </th>

                </tr>

              </thead>

              <tbody>

                {ledger.map(
                  movement => (

                    <tr
                      key={movement.id}
                      className="
                        border-b
                        border-slate-800
                      "
                    >

                      <td className="p-3">
                        {movement.type}
                      </td>

                      <td className="p-3">
                        {movement.flow_type}
                      </td>

                      <td className="p-3">

                        $
                        {Number(
                          movement.amount_clp || 0
                        ).toLocaleString("es-CL")}

                      </td>

                      <td className="p-3">
                        {movement.status}
                      </td>

                      <td className="p-3">
                        {movement.description || "-"}
                      </td>

                      <td className="p-3">
                        {formatDate(
                          movement.created_at
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </Section>

    </div>
  )
}

function Card({
  title,
  value
}: {
  title: string
  value: string
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-5
      "
    >

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p
        className="
          text-2xl
          font-bold
          mt-2
        "
      >
        {value}
      </p>

    </div>
  )
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {

  return (

    <div
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >

      <h2
        className="
          text-xl
          font-bold
          mb-5
        "
      >
        {title}
      </h2>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  )
}

function Info({
  label,
  value
}: {
  label: string
  value: any
}) {

  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "-"
      : String(value)

  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-[220px_1fr]
        gap-1
        md:gap-4
        border-b
        border-slate-800
        pb-3
      "
    >

      <p className="text-slate-500">
        {label}
      </p>

      <p
        className="
          text-slate-200
          break-all
        "
      >
        {displayValue}
      </p>

    </div>
  )
}

function EmptyText({
  value
}: {
  value: string
}) {

  return (

    <p className="text-slate-500">
      {value}
    </p>
  )
}

function formatDate(
  value: any
) {

  if (!value) {
    return "-"
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value)
  }

  return date.toLocaleString(
    "es-CL"
  )
}
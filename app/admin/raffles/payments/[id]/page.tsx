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

export default function PaymentDetailPage() {

  const params =
    useParams()

  const [loading, setLoading] =
    useState(true)

  const [payment, setPayment] =
    useState<any>(null)

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
          `/api/admin/raffles/payment/${params.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setPayment(
        json.payment
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    )
  }

  const netAmount =
    Number(
      payment.amount_clp || 0
    ) -
    Number(
      payment.provider_fee || 0
    )

  return (

    <div className="space-y-6">

      <div>

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          💳 Payment Detail
        </h1>

        <p className="text-slate-400 mt-2">
          Auditoría y trazabilidad
        </p>

      </div>

      {/* FINANCIERO */}

      <div
        className="
          grid
          md:grid-cols-3
          gap-4
        "
      >

        <Card
          title="Monto"
          value={`$${Number(
            payment.amount_clp
          ).toLocaleString()}`}
        />

        <Card
          title="Fee"
          value={`$${Number(
            payment.provider_fee
          ).toLocaleString()}`}
        />

        <Card
          title="Neto"
          value={`$${netAmount.toLocaleString()}`}
        />

      </div>

      {/* PAGO */}

      <Section title="Información Pago">

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
          label="Status"
          value={payment.status}
        />

        <Info
          label="Creado"
          value={
            new Date(
              payment.created_at
            ).toLocaleString()
          }
        />

      </Section>

      {/* COMPRADOR */}

      <Section title="Comprador">

        <Info
          label="Nombre"
          value={
            payment.orders?.buyer_name
          }
        />

        <Info
          label="Email"
          value={
            payment.orders?.buyer_email
          }
        />

        <Info
  label="Teléfono"
  value={
    payment.orders?.buyer_phone
  }
/>

        <Info
  label="IP"
  value={
    payment.orders?.ip_address
  }
/>

<Info
  label="User Agent"
  value={
    payment.orders?.user_agent
  }
/>

      </Section>

      {/* ORDEN */}

      <Section title="Orden">

        <Info
          label="Order ID"
          value={
            payment.order_id
          }
        />

        <Info
          label="Cantidad"
          value={
            payment.orders?.quantity
          }
        />

        <Info
  label="Tickets Entregados"
  value={
    payment.tickets?.length || 0
  }
/>

        <Info
          label="Estado"
          value={
            payment.orders?.status
          }
        />

        <Info
          label="Email enviado"
          value={
            payment.orders
              ?.confirmation_email_sent
              ? "Sí"
              : "No"
          }
        />

        <Info
  label="Fecha Email"
  value={
    payment.orders
      ?.confirmation_email_sent_at
  }
/>

      </Section>

      {/* SORTEO */}

      <Section title="Sorteo">

        <Info
          label="Título"
          value={
            payment.raffles?.title
          }
        />

        <Info
          label="Slug"
          value={
            payment.raffles?.slug
          }
        />

      </Section>

{/* TICKETS */}

<Section title="Tickets Asociados">

  {payment.tickets?.length ? (

    <div
  className="
    grid
    md:grid-cols-2
    xl:grid-cols-3
    gap-3
  "
>

      {payment.tickets.map(
        (ticket: any) => (

          <div
            key={ticket.id}
            className="
              flex
              justify-between
              items-center
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              p-3
            "
          >

            <div>

              <p className="font-medium">

                {ticket.ticket_code}

              </p>

              <p className="text-sm text-slate-500">

                Número:
                {" "}
                {ticket.ticket_number}

              </p>

            </div>

            <div>

              <span
                className="
                  px-2
                  py-1
                  rounded-full
                  text-xs
                  bg-green-900/40
                  text-green-300
                "
              >
                {ticket.status}
              </span>

            </div>

          </div>

        )
      )}

    </div>

  ) : (

    <p className="text-slate-500">
      Sin tickets asociados
    </p>

  )}

</Section>

      {/* AUDITORIA */}

      <Section title="Auditoría">

        <Info
          label="Metadata"
          value={
            payment.metadata
              ? "Disponible"
              : "Vacía"
          }
        />

        <Info
          label="Webhook"
          value={
            payment.webhook_payload
              ? "Recibido"
              : "No registrado"
          }
        />

      </Section>

    </div>
  )
}

function Card({
  title,
  value
}: any) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-3xl
        p-5
      "
    >

      <p className="text-slate-400">
        {title}
      </p>

      <h3
        className="
          text-3xl
          font-bold
          mt-2
        "
      >
        {value}
      </h3>

    </div>
  )
}

function Section({
  title,
  children
}: any) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-3xl
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
}: any) {

  return (

    <div
      className="
        flex
        justify-between
        gap-4
      "
    >

      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-medium break-all">
        {String(value ?? "-")}
      </span>

    </div>
  )
}
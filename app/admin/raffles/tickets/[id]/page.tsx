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

export default function TicketDetailPage() {

  const params =
    useParams()

  const [loading, setLoading] =
    useState(true)

  const [ticket, setTicket] =
    useState<any>(null)

  const [order, setOrder] =
    useState<any>(null)

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
          `/api/admin/raffles/tickets/${params.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setTicket(
        json.ticket
      )

      setOrder(
        json.order
      )

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

  return (

    <div className="space-y-6">

      <div>

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          🎟️ Ticket Detail
        </h1>

        <p className="text-slate-400 mt-2">
          Auditoría y trazabilidad completa
        </p>

      </div>

      {/* TICKET */}

      <Section title="Ticket">

        <Info
          label="Ticket ID"
          value={ticket.id}
        />

        <Info
          label="Código"
          value={ticket.ticket_code}
        />

        <Info
          label="Número"
          value={ticket.ticket_number}
        />

        <Info
          label="Estado"
          value={ticket.status}
        />

      </Section>

      {/* COMPRADOR */}

      <Section title="Comprador">

        <Info
          label="Email"
          value={ticket.buyer_email}
        />

      </Section>

      {/* ORDEN */}

      <Section title="Orden">

        <Info
          label="Order ID"
          value={ticket.order_id}
        />

        <Info
          label="Cantidad"
          value={order?.quantity}
        />

        <Info
          label="Estado"
          value={order?.status}
        />

        <Info
          label="Total"
          value={
            `$${Number(
              order?.total_clp || 0
            ).toLocaleString()}`
          }
        />

        <Info
          label="Email enviado"
          value={
            order?.confirmation_email_sent
              ? "Sí"
              : "No"
          }
        />

      </Section>

      {/* PAGO */}

      <Section title="Pago">

        <Info
          label="Payment ID"
          value={ticket.payment_id}
        />

        <Info
          label="Provider"
          value={payment?.provider}
        />

        <Info
          label="Provider Payment ID"
          value={
            payment?.provider_payment_id
          }
        />

        <Info
          label="Monto"
          value={
            `$${Number(
              payment?.amount_clp || 0
            ).toLocaleString()}`
          }
        />

        <Info
          label="Estado"
          value={payment?.status}
        />

      </Section>

      {/* SORTEO */}

      <Section title="Sorteo">

        <Info
          label="Raffle ID"
          value={
            ticket.raffles?.id
          }
        />

        <Info
          label="Título"
          value={
            ticket.raffles?.title
          }
        />

        <Info
          label="Slug"
          value={
            ticket.raffles?.slug
          }
        />

        <Info
          label="Estado"
          value={
            ticket.raffles?.status
          }
        />

      </Section>

      {/* RESERVA */}

      <Section title="Reserva">

        <Info
          label="Reserved Until"
          value={
            ticket.reserved_until
          }
        />

        <Info
          label="Reservation Token"
          value={
            ticket.reservation_token
          }
        />

      </Section>

      {/* AUDITORIA */}

      <Section title="Auditoría">

        <Info
          label="Creado"
          value={
            new Date(
              ticket.created_at
            ).toLocaleString()
          }
        />

        <Info
          label="Actualizado"
          value={
            new Date(
              ticket.updated_at
            ).toLocaleString()
          }
        />

        <Info
          label="Metadata"
          value={
            ticket.metadata
              ? "Disponible"
              : "Vacía"
          }
        />

      </Section>

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
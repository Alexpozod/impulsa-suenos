"use client"

import {
  useEffect,
  useState
}
from "react"

import {
  useParams
}
from "next/navigation"

import { supabase }
from "@/src/lib/supabase"

export default function AdminRaffleDetailPage() {

  const params =
    useParams()

  const raffleId =
    params.id as string

  const [loading, setLoading] =
    useState(true)

  const [orders, setOrders] =
    useState<any[]>([])

  const [payments, setPayments] =
    useState<any[]>([])

  const [tickets, setTickets] =
    useState<any[]>([])

  const [fraud, setFraud] =
    useState<any[]>([])

  useEffect(() => {

    if (!raffleId) return

    load()

  }, [raffleId])

  async function authHeaders() {

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    return {
      Authorization:
        `Bearer ${session?.access_token}`
    }
  }

  async function load() {

    try {

      setLoading(true)

      const headers =
        await authHeaders()

      const [
        ordersRes,
        paymentsRes,
        ticketsRes,
        fraudRes
      ] = await Promise.all([

        fetch(
          `/api/admin/raffles/orders?raffle_id=${raffleId}`,
          { headers }
        ),

        fetch(
          `/api/admin/raffles/payments?raffle_id=${raffleId}`,
          { headers }
        ),

        fetch(
          `/api/admin/raffles/tickets?raffle_id=${raffleId}`,
          { headers }
        ),

        fetch(
          `/api/admin/raffles/fraud?raffle_id=${raffleId}`,
          { headers }
        )

      ])

      const ordersJson =
        await ordersRes.json()

      const paymentsJson =
        await paymentsRes.json()

      const ticketsJson =
        await ticketsRes.json()

      const fraudJson =
        await fraudRes.json()

      setOrders(
        ordersJson.orders || []
      )

      setPayments(
        paymentsJson.payments || []
      )

      setTickets(
        ticketsJson.tickets || []
      )

      setFraud(
        fraudJson.orders || []
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

    <div className="p-6 space-y-8">

      <div>

        <h1 className="text-3xl font-bold">
          🎟️ Sorteo Detail
        </h1>

        <p className="text-slate-500 mt-2">
          {raffleId}
        </p>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
        "
      >

        <Card
          title="Orders"
          value={orders.length}
        />

        <Card
          title="Payments"
          value={payments.length}
        />

        <Card
          title="Tickets"
          value={tickets.length}
        />

        <Card
          title="Fraud Flags"
          value={
            fraud.filter(
              f =>
                f.risk_level !== "low"
            ).length
          }
        />

      </div>

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
        rounded-2xl
        p-5
      "
    >

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2 text-white">
        {value}
      </h3>

    </div>
  )
}
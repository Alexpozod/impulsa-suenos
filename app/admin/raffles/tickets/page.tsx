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

export default function RaffleTicketsPage() {

  const [loading, setLoading] =
    useState(true)

  const [tickets, setTickets] =
    useState<any[]>([])

   const [pagination, setPagination] =
    useState<any>(null)

  const [stats, setStats] =
    useState({
      totalTickets: 0,
      availableTickets: 0,
      reservedTickets: 0,
      paidTickets: 0
    })

  const [page, setPage] =
    useState(1)

  const [status, setStatus] =
    useState("")

  const [search, setSearch] =
    useState("")

      const [raffles, setRaffles] =
    useState<any[]>([])

  const [assigning, setAssigning] =
    useState(false)

  const [assignmentError, setAssignmentError] =
    useState("")

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("")

  const [assignedTickets, setAssignedTickets] =
    useState<any[]>([])

  const [assignmentForm, setAssignmentForm] =
    useState({

      raffle_id: "",

      buyer_name: "",

      buyer_email: "",

      buyer_phone: "",

      quantity: "10",

      campaign_name: "",

      reason: ""

    })

  useEffect(() => {

    load()

  }, [page, status])

    useEffect(() => {

    loadRaffles()

  }, [])

    async function loadRaffles() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          "/api/admin/raffles/list?page=1&limit=100",
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
          "No fue posible cargar los sorteos"
        )
      }

      setRaffles(
        json?.raffles || []
      )

    } catch (error) {

      console.error(
        "load raffles error",
        error
      )

      setAssignmentError(
        "No fue posible cargar la lista de sorteos."
      )
    }
  }

  async function load() {

    try {

      setLoading(true)

      const params =
        new URLSearchParams({

          page: String(page),

          limit: "50",

          status,

          search

        })

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          `/api/admin/raffles/tickets?${params}`,
          {
            headers: {

              Authorization:
                `Bearer ${session?.access_token}`

            }
          }
        )

      const json =
        await res.json()

      setTickets(
        json?.tickets || []
      )

            setPagination(
        json?.pagination || null
      )

      setStats(
        json?.stats || {
          totalTickets: 0,
          availableTickets: 0,
          reservedTickets: 0,
          paidTickets: 0
        }
      )

    } catch (error) {

      console.error(error)

        } finally {

      setLoading(false)
    }
  }

  async function assignComplimentaryTickets() {

    try {

      setAssigning(true)

      setAssignmentError("")

      setAssignmentSuccess("")

      setAssignedTickets([])

      const quantity =
        Number(
          assignmentForm.quantity
        )

      if (!assignmentForm.raffle_id) {

        setAssignmentError(
          "Debes seleccionar un sorteo."
        )

        return
      }

      if (
        !assignmentForm
          .buyer_name
          .trim()
      ) {

        setAssignmentError(
          "Debes ingresar el nombre del participante."
        )

        return
      }

      if (
        !assignmentForm
          .buyer_email
          .trim()
      ) {

        setAssignmentError(
          "Debes ingresar el correo del participante."
        )

        return
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {

        setAssignmentError(
          "La cantidad debe estar entre 1 y 100 tickets."
        )

        return
      }

      const {
        data: { session }
      } =
        await supabase.auth
          .getSession()

      const res =
        await fetch(
          "/api/admin/raffles/tickets",
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session?.access_token}`

            },

            body:
              JSON.stringify({

                raffle_id:
                  assignmentForm.raffle_id,

                buyer_name:
                  assignmentForm
                    .buyer_name
                    .trim(),

                buyer_email:
                  assignmentForm
                    .buyer_email
                    .trim()
                    .toLowerCase(),

                buyer_phone:
                  assignmentForm
                    .buyer_phone
                    .trim() || undefined,

                quantity,

                campaign_name:
                  assignmentForm
                    .campaign_name
                    .trim() || undefined,

                reason:
                  assignmentForm
                    .reason
                    .trim() || undefined

              })
          }
        )

      const json =
        await res.json()

      if (!res.ok) {

        const messages:
          Record<string, string> = {

          raffle_id_required:
            "Debes seleccionar un sorteo.",

          buyer_name_required:
            "Debes ingresar el nombre del participante.",

          buyer_email_required:
            "Debes ingresar el correo del participante.",

          invalid_buyer_email:
            "El correo ingresado no es válido.",

          invalid_quantity:
            "La cantidad debe estar entre 1 y 100 tickets.",

          raffle_not_found:
            "El sorteo seleccionado no existe.",

          raffle_not_assignable:
            "Este sorteo no permite nuevas asignaciones.",

          not_enough_tickets_available:
            "No existen suficientes tickets disponibles.",

          complimentary_ticket_assignment_conflict:
            "Los tickets fueron tomados por otra operación. Intenta nuevamente.",

          complimentary_assignment_failed:
            "No fue posible completar la asignación."

        }

        throw new Error(
          messages[json?.error] ||
          json?.error ||
          "No fue posible completar la asignación."
        )
      }

      setAssignedTickets(
        json?.tickets || []
      )

      setAssignmentSuccess(
        `${json?.tickets?.length || quantity} tickets promocionales asignados correctamente.`
      )

      setAssignmentForm({

        raffle_id:
          assignmentForm.raffle_id,

        buyer_name: "",

        buyer_email: "",

        buyer_phone: "",

        quantity: "10",

        campaign_name: "",

        reason: ""

      })

      setPage(1)

      setStatus("")

      setSearch("")

      await load()

    } catch (error) {

      console.error(
        "assign complimentary tickets error",
        error
      )

      setAssignmentError(
        error instanceof Error
          ? error.message
          : "No fue posible completar la asignación."
      )

    } finally {

      setAssigning(false)
    }
  }

  return (

    <div className="space-y-5">

      <PageHeader
  title="🎟️ Tickets"
  description="Inventario y estado de tickets"
/>

      {/* COMPLIMENTARY ASSIGNMENT */}

      <div
        className="
          bg-slate-900
          border border-slate-800
          rounded-xl
          p-5
          space-y-5
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            🎁 Asignar tickets promocionales
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-400
            "
          >
            Entrega participaciones gratuitas usando inventario real, sin pago ni ingreso financiero.
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-4
          "
        >

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Sorteo *
            </label>

            <select
              value={
                assignmentForm.raffle_id
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  raffle_id:
                    e.target.value
                })
              }
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            >

              <option value="">
                Seleccionar sorteo
              </option>

              {raffles.map(
                raffle => (

                  <option
                    key={raffle.id}
                    value={raffle.id}
                  >
                    {raffle.title}
                    {" — "}
                    {raffle.status}
                  </option>

                )
              )}

            </select>

          </div>

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Nombre del participante *
            </label>

            <input
              value={
                assignmentForm.buyer_name
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  buyer_name:
                    e.target.value
                })
              }
              placeholder="Nombre completo"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Correo electrónico *
            </label>

            <input
              type="email"
              value={
                assignmentForm.buyer_email
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  buyer_email:
                    e.target.value
                })
              }
              placeholder="correo@ejemplo.com"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Teléfono
            </label>

            <input
              value={
                assignmentForm.buyer_phone
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  buyer_phone:
                    e.target.value
                })
              }
              placeholder="+56 9..."
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Cantidad *
            </label>

            <input
              type="number"
              min="1"
              max="100"
              value={
                assignmentForm.quantity
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  quantity:
                    e.target.value
                })
              }
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          <div className="space-y-2">

            <label
              className="
                text-sm
                text-slate-300
              "
            >
              Campaña o promoción
            </label>

            <input
              value={
                assignmentForm.campaign_name
              }
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  campaign_name:
                    e.target.value
                })
              }
              placeholder="Ej: Concurso Instagram julio"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-4 py-3
                outline-none
              "
            />

          </div>

        </div>

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-slate-300
            "
          >
            Motivo o respaldo
          </label>

          <textarea
            value={
              assignmentForm.reason
            }
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                reason:
                  e.target.value
              })
            }
            placeholder="Ej: Cumplió las condiciones de seguir, comentar y compartir."
            rows={3}
            className="
              w-full
              bg-slate-950
              border border-slate-700
              rounded-xl
              px-4 py-3
              outline-none
              resize-none
            "
          />

        </div>

        {assignmentError && (

          <div
            className="
              rounded-xl
              border border-red-800
              bg-red-950/40
              px-4 py-3
              text-sm
              text-red-300
            "
          >
            {assignmentError}
          </div>

        )}

        {assignmentSuccess && (

          <div
            className="
              rounded-xl
              border border-green-800
              bg-green-950/40
              px-4 py-3
              text-sm
              text-green-300
            "
          >
            {assignmentSuccess}
          </div>

        )}

        {assignedTickets.length > 0 && (

          <div
            className="
              rounded-xl
              border border-cyan-900
              bg-cyan-950/20
              p-4
            "
          >

            <p
              className="
                mb-3
                text-sm
                font-medium
                text-cyan-300
              "
            >
              Tickets asignados
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {assignedTickets.map(
                ticket => (

                  <span
                    key={ticket.id}
                    className="
                      rounded-lg
                      border border-cyan-800
                      bg-slate-950
                      px-3 py-2
                      text-sm
                      font-medium
                      text-cyan-200
                    "
                  >
                    {ticket.ticket_code}
                  </span>

                )
              )}

            </div>

          </div>

        )}

        <div
          className="
            flex
            justify-end
          "
        >

          <button
            type="button"
            disabled={assigning}
            onClick={
              assignComplimentaryTickets
            }
            className="
              px-5 py-3
              rounded-xl
              bg-cyan-600
              hover:bg-cyan-500
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
              font-medium
            "
          >
            {assigning
              ? "Asignando..."
              : "Asignar tickets gratuitos"}
          </button>

        </div>

      </div>


      {/* KPI */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
        "
      >

                <MetricCard
          title="Total"
          value={
            stats.totalTickets
          }
        />

        <MetricCard
          title="Available"
          value={
            stats.availableTickets
          }
        />

        <MetricCard
          title="Reserved"
          value={
            stats.reservedTickets
          }
        />

        <MetricCard
          title="Paid"
          value={
            stats.paidTickets
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
            placeholder="Buscar ticket o email..."
            className="
              bg-slate-950
              border border-slate-700
              rounded-xl
              px-4 py-3
              outline-none
            "
          />

          <select
            value={status}
                        onChange={(e) => {

              setPage(1)

              setStatus(
                e.target.value
              )
            }}
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

            <option value="available">
              Available
            </option>

            <option value="reserved">
              Reserved
            </option>

                        <option value="paid">
              Paid
            </option>

            <option value="complimentary">
              Complimentary
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
            Buscar
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
                  Ticket
                </th>

                <th className="p-4">
                  Sorteo
                </th>

                <th className="p-4">
                  Comprador
                </th>

                <th className="p-4">
                  Estado
                </th>

                <th className="p-4">
  Reserva
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
                    colSpan={6}
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
                tickets.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    Sin tickets
                  </td>

                </tr>
              )}

              {!loading &&
                tickets.map((ticket) => (

                <tr
                  key={ticket.id}
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
                        {ticket.ticket_code}
                      </p>

                      <p className="text-sm text-slate-500">
                        #{ticket.ticket_number}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    <div>

                      <p className="font-medium">
                        {ticket.raffles?.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        /{ticket.raffles?.slug}
                      </p>

                    </div>

                  </td>

                  <td className="p-4">

                    {ticket.buyer_email || "-"}

                  </td>

                  <td className="p-4">

                    <StatusBadge
                      status={ticket.status}
                    />

                  </td>

                  <td className="p-4 text-sm text-slate-400">

                    {ticket.reserved_until
                      ? new Date(
                          ticket.reserved_until
                        ).toLocaleString()
                      : "-"}

                  </td>

                  <td className="p-4">

  <button
    onClick={() => {

      window.location.href =
        `/admin/raffles/tickets/${ticket.id}`

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
"use client"

import { useEffect, useState } from "react"

import { supabase }
from "@/src/lib/supabase"

export default function RafflePartnerDashboardPage() {

  const [data, setData] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

    const [page, setPage] =
  useState(1)

  const [search, setSearch] =
  useState("")

const [period, setPeriod] =
  useState("all")

const PER_PAGE = 10

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/dashboard",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setData(json)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  if (loading) {

    return (
      <div className="p-6">
        Cargando dashboard...
      </div>
    )

  }

  if (!data?.affiliate) {

       return (

      <div className="p-6">

        <h1 className="text-3xl font-bold">
          Partners
        </h1>

        <p className="mt-4 text-slate-400">
          No tienes una cuenta de afiliado asignada.
        </p>

      </div>

    )

  }

const sales =
  data.sales || []

const filteredSales =
  sales.filter((sale: any) => {

    const text = (
  `${sale.buyerName ?? ""} ` +
  `${sale.buyerEmail ?? ""} ` +
  `${sale.buyerPhone ?? ""} ` +
  `${sale.quantity ?? ""} ` +
  `${sale.total ?? ""}`
).toLowerCase()

    const matchesSearch =
      text.includes(
        search.toLowerCase()
      )

    if (period === "all") {

      return matchesSearch

    }

    const created =
      new Date(sale.createdAt)

    const now =
      new Date()

    if (period === "month") {

      if (
        created.getMonth() !== now.getMonth() ||
        created.getFullYear() !== now.getFullYear()
      ) {

        return false

      }

    }

    if (period === "today") {

      if (
        created.toDateString() !==
        now.toDateString()
      ) {

        return false

      }

    }

    return matchesSearch

  })

const totalPages =
  Math.max(
    1,
    Math.ceil(
      filteredSales.length / PER_PAGE
    )
  )

const paginatedSales =
  filteredSales.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  )
  
  return (

    <div className="p-6 space-y-8">

      <div
  className="
    rounded-3xl
    p-6
    text-white
    bg-gradient-to-r
    from-blue-600
    via-purple-600
    to-cyan-500
  "
>

  <div className="flex items-center gap-4">

    <img
      src="/favicon-removebg-preview.png"
      alt="Partners"
      className="w-12 h-12"
    />

    <div>

      <h1 className="text-3xl font-black">
        Programa de Partners
      </h1>

      <p className="opacity-90 mt-2">
        Comparte sorteos y gana comisiones por cada venta.
      </p>

    </div>

  </div>

  <div
    className="
      mt-5
      bg-white/10
      backdrop-blur
      rounded-2xl
      p-5
    "
  >

    <div className="text-sm opacity-80">
      Código Afiliado
    </div>

    <div
      className="
        text-3xl
        font-black
        mt-2
      "
    >
      {data.affiliate.code}
    </div>

    <div className="flex gap-3 mt-5">

      <button
        onClick={() => {
          navigator.clipboard.writeText(
            data.affiliate.code
          )

          alert(
            "Código copiado"
          )
        }}
        className="
          px-5
          py-3
          rounded-xl
          bg-white
          text-black
          font-bold
        "
      >
        Copiar Código
      </button>

      <a
  href="/raffles/partners/links"
  className="
    px-5
    py-3
    rounded-xl
    bg-white/15
    hover:bg-white/25
    text-white
    font-bold
    transition
  "
>
  Ver Links
</a>

    </div>

  </div>

</div>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      "
      >

        <Card
          title="Comisión"
          value={`${data.affiliate.commissionPercent}%`}
        />

        <Card
          title="Clicks"
          value={data.stats.clicks}
        />

        <Card
          title="Checkouts"
          value={data.stats.beginCheckout}
        />

        <Card
          title="Pagos"
          value={data.stats.paidOrders}
        />

        <Card
          title="Ventas Generadas"
          value={`$${Number(
            data.stats.revenue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Comisión Generada"
          value={`$${Number(
            data.stats.estimatedCommission || 0
          ).toLocaleString()}`}
        />

       <Card
  title="Disponible para Retirar"
  value={`$${Number(
    data.stats.availableCommission || 0
  ).toLocaleString()}`}
/>

      </div>

      <div
        className="
          mt-10
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-xl
          shadow-slate-200/60
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-slate-200
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
            "
          >

            🛒 Últimas Compras con tu Código

          </h2>

          <p
            className="
              text-slate-400
              mt-1
            "
          >

            Solo se muestran las compras atribuidas a tu código o enlace.

          </p>

        </div>

        <div
  className="
    flex
    flex-col
    md:flex-row
    gap-3
    px-6
    py-4
    border-b
    border-slate-200
  "
>

  <input
    type="text"
    placeholder="Buscar por nombre, correo, teléfono o tickets..."
    value={search}
    onChange={(e) => {

      setSearch(e.target.value)

      setPage(1)

    }}
    className="
      flex-1
      rounded-xl
      border
      border-slate-300
      px-4
      py-2
    "
  />

  <select
    value={period}
    onChange={(e) => {

      setPeriod(e.target.value)

      setPage(1)

    }}
    className="
      rounded-xl
      border
      border-slate-300
      px-4
      py-2
    "
  >

    <option value="all">
      Todo
    </option>

    <option value="today">
      Hoy
    </option>

    <option value="month">
      Este mes
    </option>

  </select>

</div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table className="w-full">

            <thead>

              <tr
                className="
                  border-b
                  border-slate-200
                  bg-gradient-to-r
                    from-cyan-50
                    to-violet-50
                "
              >

                <th className="p-4 text-left">
                  Fecha
                </th>

                <th className="p-4 text-left">
                  Cliente
                </th>

                <th className="p-4 text-left">
                  Tickets
                </th>

                <th className="p-4 text-left">
                  Compra
                </th>

                <th className="p-4 text-left">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {

                paginatedSales.length === 0

?

(

<tr>

<td
colSpan={5}
className="
p-10
text-center
text-slate-500
"
>

<div
className="
flex
flex-col
items-center
justify-center
"
>

<div className="text-lg font-semibold">
Todavía no existen compras con tu código.
</div>

<div className="mt-2 text-sm">
Comparte tus enlaces para comenzar a generar ventas.
</div>

</div>

</td>

</tr>

)

:

paginatedSales.map((sale:any)=>(

                  <tr

                    key={sale.id}

                    className="
                      border-b
                      border-slate-200
                      hover:bg-cyan-50
                      transition-colors
                    "

                  >

                    <td className="p-4">

                      {

                        new Date(
                          sale.createdAt
                        ).toLocaleString("es-CL")

                      }

                    </td>

                    <td className="p-4">

                      <div className="font-semibold">

                        {sale.buyerName}

                      </div>

                      <div className="text-xs text-slate-500">

                        {sale.buyerEmail}

                      </div>

                      <div className="text-xs text-slate-400">

                        {sale.buyerPhone}

                      </div>

                    </td>

                    <td className="p-4">

                      {sale.quantity}

                    </td>

                    <td className="p-4">

                      $

                      {Number(
                        sale.total
                      ).toLocaleString()}

                    </td>

                    <td className="p-4">

                      {

                        sale.paymentStatus === "paid"

                        ||

                        sale.paymentStatus === "approved"

                        ?

                        "✅ Pagado"

                        :

                        sale.paymentStatus

                      }

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

          <div
  className="
    flex
    items-center
    justify-between
    px-6
    py-4
    border-t
    border-slate-200
    bg-slate-50
  "
>

  <button

    disabled={page === 1}

    onClick={() =>
  setPage(
    Math.max(page - 1, 1)
  )
}

    className="
      px-4
      py-2
      rounded-lg
      border
      border-slate-300
      disabled:opacity-40
      disabled:cursor-not-allowed
    "

  >

    ← Anterior

  </button>

  <div
  className="
    text-center
  "
>

  <div
    className="
      text-sm
      font-semibold
      text-slate-700
    "
  >

    Página {page} de {totalPages}

  </div>

  <div
    className="
      text-xs
      text-slate-500
      mt-1
    "
  >

    Mostrando

    {" "}

    {paginatedSales.length}

    {" de "}

    {filteredSales.length}

    compras

  </div>

</div>

  <button

    disabled={
page >= totalPages
}

    onClick={() =>
  setPage(
    Math.min(page + 1, totalPages)
  )
}

    className="
      px-4
      py-2
      rounded-lg
      border
      border-slate-300
      disabled:opacity-40
      disabled:cursor-not-allowed
    "

  >

    Siguiente →

  </button>

</div>

        </div>

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
      bg-gradient-to-br
      from-blue-950
      to-purple-950
      border
      border-blue-800/30
      rounded-3xl
      p-5
    "
    >

      <p
        className="
        text-slate-400
        text-sm
      "
      >
        {title}
      </p>

      <h3
        className="
        text-3xl
        font-bold
        mt-3
        text-white
      "
      >
        {value}
      </h3>

    </div>

  )

}
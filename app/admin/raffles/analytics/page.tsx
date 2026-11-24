"use client"

import {
  useEffect,
  useState
}
from "react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

import { supabase }
from "@/src/lib/supabase"

export default function AdminRafflesPage() {

  const [data, setData] =
    useState<any>(null)

const revenueChart =
  Object.entries(
    data?.dailyRevenue || {}
  ).map(

    ([date, value]) => ({

      date,

      revenue: value

    })
  )

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const {
  data: { session }
} = await supabase.auth.getSession()

const res =
  await fetch(
    "/api/admin/raffles/analytics",
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
        Cargando...
      </div>
    )
  }

  return (

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
  📊 Analytics
</h1>

        <p className="text-[#002314] mt-2">
  Revenue, conversiones, marketing e influencers
</p>

      </div>

      <div
className="
grid
grid-cols-2
md:grid-cols-3
xl:grid-cols-6
gap-4
"
>

<a
href="/admin/raffles/create"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
➕
</div>

<div className="mt-3 font-bold">
Crear Sorteo
</div>
</a>

<a
href="/admin/raffles/manage"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🎟️
</div>

<div className="mt-3 font-bold">
Gestionar
</div>
</a>

<a
href="/admin/raffles/orders"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🛒
</div>

<div className="mt-3 font-bold">
Órdenes
</div>
</a>

<a
href="/admin/raffles/payments"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
💳
</div>

<div className="mt-3 font-bold">
Pagos
</div>
</a>

<a
href="/admin/raffles/tickets"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🎫
</div>

<div className="mt-3 font-bold">
Tickets
</div>
</a>

<a
href="/admin/raffles/results"
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🏆
</div>

<div className="mt-3 font-bold">
Resultados
</div>
</a>

</div>

      {/* METRICS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-7
          gap-4
        "
      >

        <Card
          title="Revenue"
          value={`$${Number(
            data?.revenue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Pagos"
          value={data?.payments || 0}
        />

        <Card
          title="Tickets"
          value={data?.tickets || 0}
        />

        <Card
          title="Conversión"
          value={`${Number(
            data?.conversionRate || 0
          ).toFixed(2)}%`}
        />

            <Card
            title="Visits"
            value={
                Number(
                data?.visits || 0
                ).toLocaleString()
            }
            />

            <Card
            title="AOV"
            value={`$${Number(
                data?.avgOrderValue || 0
            ).toLocaleString()}`}
            />

            <Card
            title="Revenue / Visit"
            value={`$${Number(
                data?.revenuePerVisit || 0
            ).toFixed(0)}`}
            />

      </div>

      {/* SYSTEM */}

<div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-4
  "
>

  <a
    href="/admin/raffles/system"
    className="
  bg-gradient-to-br
  from-[#EDE8FD]
  to-[#FAF9F5]
  border
  border-[#002314]/20
  rounded-3xl
  p-6
  hover:border-blue-500
  transition
"
  >

    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <div>

        <p
  className="
    text-xs
    text-[#002314]
    uppercase
    tracking-wider
  "
>
          System Health
        </p>

        <h3
  className="
    text-xl
    font-bold
    mt-2
    text-[#002314]
  "
>
          🛡️ Monitor
        </h3>

      </div>

      <div
        className="
  text-sm
  font-medium
  text-[#7048E8]
"
      >
        View →
      </div>

    </div>

  </a>

</div>

      {/* CHECKOUT */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        <Card
          title="Begin Checkout"
          value={data?.beginCheckout || 0}
        />

        <Card
          title="Payment Success"
          value={data?.paymentSuccess || 0}
        />

        <Card
          title="Payment Failed"
          value={data?.paymentFailed || 0}
        />

      </div>

      {/* TOP RAFFLES */}

<div
  className="
    bg-gradient-to-br
from-[#EDE8FD]
to-[#FAF9F5]
border
border-[#002314]/20
rounded-3xl
p-6
  "
>

  <h2
  className="
    text-xl
    font-bold
    text-[#002314]
    mb-4
  "
>
    🏆 Top Sorteos
  </h2>

  <div className="space-y-3">

    {Object.entries(
      data?.topRaffles || {}
    ).map(

      ([key, value]: any) => (

        <div
          key={key}
          className="
            flex
            items-center
            justify-between
            border-b border-[#002314]/20
            pb-2
          "
        >

          <div>

            <p
  className="
    font-semibold
    text-[#002314]
  "
>
              {value.title}
            </p>

          </div>

          <div className="text-right">

            <p
  className="
    font-bold
    text-emerald-800
  "
>

              $
              {Number(
                value.revenue || 0
              ).toLocaleString()}

            </p>

            <p className="text-sm text-[#002314]">

              {value.conversions}
              {" "}
              conversiones

            </p>

          </div>

        </div>
      )
    )}

  </div>

</div>

{/* REVENUE CHART */}

<div
  className="
    bg-gradient-to-br
    from-[#EDE8FD]
    to-[#FAF9F5]
    border
    border-[#002314]/20
    rounded-3xl
    p-6
  "
>

  <h2
  className="
    text-xl
    font-bold
    text-[#002314]
    mb-4
  "
>
    📈 Revenue Diario
  </h2>

  <div className="h-80">

    <ResponsiveContainer
      width="100%"
      height="100%"
    >

      <LineChart
  data={revenueChart}
  margin={{
    top: 20,
    right: 20,
    left: 10,
    bottom: 10
  }}
>

        <XAxis
  dataKey="date"
  stroke="#002314"
/>

        <YAxis
  stroke="#002314"
/>

        <Tooltip
  contentStyle={{
    background: "#FAF9F5",
    border: "1px solid #EDE8FD"
  }}
  formatter={(value: any) => [
    `$${Number(value).toLocaleString()}`,
    "Revenue"
  ]}
/>

       <Line
  type="monotone"
  dataKey="revenue"
  stroke="#7048E8"
  strokeWidth={3}
  dot={false}
  activeDot={{
    r: 6
  }}
/>

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

{/* SOURCES */}

<div
  className="
   bg-gradient-to-br
from-[#EDE8FD]
to-[#FAF9F5]
border
border-[#002314]/20
rounded-3xl
p-6
  "
>

  <h2
  className="
    text-xl
    font-bold
    text-[#002314]
    mb-4
  "
>
    📊 Sources
  </h2>

  <div className="space-y-3">

          {Object.entries(
            data?.sources || {}
          ).map(

            ([key, value]: any) => (

              <div
                key={key}
                className="
                  flex
                  items-center
                  justify-between
                  border-b border-[#002314]/20
                  pb-2
                "
              >

                <div>
                  <p
  className="
    font-semibold
    text-[#002314]
  "
>
                    {key}
                  </p>
                </div>

                <div className="text-right">

                  <p
  className="
    font-bold
    text-emerald-800
  "
>
                    $
                    {Number(
                      value.revenue || 0
                    ).toLocaleString()}
                  </p>

                  <p className="text-sm text-[#002314]">
                    {value.conversions}
                    {" "}
                    conversiones
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </div>

{/* CAMPAIGNS */}

<div
  className="
    bg-gradient-to-br
from-[#EDE8FD]
to-[#FAF9F5]
border
border-[#002314]/20
rounded-3xl
p-6
  "
>

  <h2
  className="
    text-xl
    font-bold
    text-[#002314]
    mb-4
  "
>
    🚀 Campaign Tracking
  </h2>

  <div className="space-y-3">

    {Object.entries(
      data?.campaigns || {}
    ).map(

      ([key, value]: any) => (

        <div
          key={key}
          className="
            flex
            items-center
            justify-between
            border-b border-[#002314]/20
            pb-2
          "
        >

          <div>

            <p
  className="
    font-semibold
    text-[#002314]
  "
>
              {key}
            </p>

          </div>

          <div className="text-right">

            <p
  className="
    font-bold
    text-emerald-800
  "
>

              $
              {Number(
                value.revenue || 0
              ).toLocaleString()}

            </p>

            <p className="text-sm text-[#002314]">

              {value.conversions}
              {" "}
              conversiones

            </p>

          </div>

        </div>
      )
    )}

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
        from-[#EDE8FD]
        to-[#FAF9F5]
        border
        border-[#002314]/20
        rounded-3xl
        p-5
      "
    >

      <p
        className="
          text-[#002314]
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
          text-[#002314]
        "
      >
        {value}
      </h3>

    </div>

  )
}
"use client"

import Link from "next/link"
import { useState } from "react"

import { useEffect } from "react"
import { supabase } from "@/src/lib/supabase"

const sections = [
  {
    title: "Crear Sorteo",
    description: "Nuevo sorteo",
    icon: "➕",
    href: "/admin/raffles/create"
  },
  {
    title: "Gestionar",
    description: "Administrar",
    icon: "🎟️",
    href: "/admin/raffles/manage"
  },
  {
    title: "Órdenes",
    description: "Compras",
    icon: "🛒",
    href: "/admin/raffles/orders"
  },
  {
    title: "Pagos",
    description: "Flow",
    icon: "💳",
    href: "/admin/raffles/payments"
  },
  {
    title: "Tickets",
    description: "Inventario",
    icon: "🎫",
    href: "/admin/raffles/tickets"
  },
  {
    title: "Resultados",
    description: "Ganadores",
    icon: "🏆",
    href: "/admin/raffles/results"
  },
  {
    title: "Analytics",
    description: "Ventas",
    icon: "📈",
    href: "/admin/raffles/analytics",
    featured: true
  },
  {
    title: "Fraud",
    description: "Seguridad",
    icon: "🚨",
    href: "/admin/raffles/fraud"
  },
  {
    title: "Exports",
    description: "Reportes",
    icon: "📤",
    href: "/admin/raffles/exports"
  },
  {
    title: "Influencers",
    description: "Afiliados",
    icon: "⭐",
    href: "/admin/raffles/affiliates"
  },
  {
    title: "Retiros",
    description: "Pagos",
    icon: "💰",
    href: "/admin/raffles/affiliate-payouts"
  },
  {
    title: "Referidos",
    description: "Programa",
    icon: "🎁",
    href: "/admin/raffles/referrals"
  }
  ,
{
  title: "Promociones",
  description: "Bundles y cupones",
  icon: "🎉",
  href: "/admin/raffles/promotions"
}
]

export default function AdminRafflesPage() {

const [prizeValue,setPrizeValue] =
useState("20000000")

const [fixedCosts,setFixedCosts] =
useState("2000000")

const [marketingPercent,setMarketingPercent] =
useState("15")

const [influencerPercent,setInfluencerPercent] =
useState("10")

const [flowPercent,setFlowPercent] =
useState("2.95")

const [ivaPercent,setIvaPercent] =
useState("19")

const [taxReservePercent,setTaxReservePercent] =
useState("27")

const [targetProfit,setTargetProfit] =
useState("10000000")

const [
  raffles,
  setRaffles
] = useState<any[]>([])

const [
  selectedRaffle,
  setSelectedRaffle
] = useState("")

const [saving,setSaving] =
useState(false)

const [saveMessage,setSaveMessage] =
useState("")

const [progressData,setProgressData] =
useState<any>(null)

const [extraPrizes,setExtraPrizes] =
useState<any[]>([])

const [extraPrizeName,setExtraPrizeName] =
useState("")

const [extraPrizeCost,setExtraPrizeCost] =
useState("")

const [scenarioData,setScenarioData] =
useState<any>(null)

const [dashboardData,setDashboardData] =
useState<any>(null)

const prize =
Number(prizeValue || 0)

const fixed =
Number(fixedCosts || 0)

const marketing =
Number(marketingPercent || 0)

const influencer =
Number(influencerPercent || 0)

const flow =
Number(flowPercent || 0)

const iva =
Number(ivaPercent || 0)

const taxReserve =
Number(
  taxReservePercent || 0
)

const profit =
Number(targetProfit || 0)

const totalPercentCosts =
marketing +
influencer +
flow +
iva +
taxReserve

const requiredRevenue =
(
prize +
fixed +
profit
)
/
(
1 -
(
totalPercentCosts / 100
)
)

const marketingAmount =
requiredRevenue *
(marketing / 100)

const influencerAmount =
requiredRevenue *
(influencer / 100)

const flowAmount =
requiredRevenue *
(flow / 100)

const ivaAmount =
requiredRevenue *
(iva / 100)

const taxReserveAmount =
requiredRevenue *
(taxReserve / 100)

const projectedFreeCash =

requiredRevenue

-

prize

-

fixed

-

marketingAmount

-

influencerAmount

-

flowAmount

-

ivaAmount

-

taxReserveAmount

const recommendedTicket =
10000

const minimumTickets =
Math.ceil(
requiredRevenue /
recommendedTicket
)

const breakEvenRevenue =
prize + fixed

const breakEvenTickets =
Math.ceil(
breakEvenRevenue /
recommendedTicket
)

useEffect(() => {

  loadRaffles()

  loadDashboard()

}, [])

async function loadDashboard(){

  try{

    const {
      data:{ session }
    } =
      await supabase.auth.getSession()

    const response =
      await fetch(

        "/api/admin/raffles/analytics",

        {
          headers:{
            Authorization:
              `Bearer ${session?.access_token}`
          }
        }

      )

    const json =
      await response.json()

    setDashboardData(
      json
    )

  }

  catch(error){

    console.error(error)

  }

}

async function loadRaffles() {

  try {

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const response =
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
      await response.json()

    setRaffles(
      json.raffles || []
    )

  } catch (error) {

    console.error(error)

  }

}

async function loadFinancialPlan(

  raffleId: string

) {

  if (!raffleId) {

    return

  }

  try {

    const response =
      await fetch(

        `/api/internal/raffles/financial-plan/${raffleId}`

      )

    const json =
      await response.json()

    if (!json.plan) {

      return

    }

    const plan =
      json.plan

    setPrizeValue(
      String(
        plan.prize_cost || 0
      )
    )

    setFixedCosts(
      String(
        plan.fixed_costs || 0
      )
    )

    setMarketingPercent(
      String(
        plan.marketing_percent || 0
      )
    )

    setInfluencerPercent(
      String(
        plan.influencer_percent || 0
      )
    )

    setFlowPercent(
      String(
        plan.flow_percent || 0
      )
    )

    setIvaPercent(
      String(
        plan.iva_percent || 0
      )
    )

    setTargetProfit(
      String(
        plan.target_profit || 0
      )
    )

   await loadFinancialProgress(
  raffleId
)

await loadExtraPrizes(
  raffleId
)

await loadScenarios(
  raffleId
)

  } catch (error) {

    console.error(error)

  }

}

async function saveFinancialPlan() {

  if (!selectedRaffle) {

    alert(
      "Selecciona un sorteo"
    )

    return

  }

  try {

    setSaving(true)

    setSaveMessage("")

    const response =
      await fetch(

        "/api/internal/raffles/financial-plan/save",

        {

          method:"POST",

          headers:{

            "Content-Type":
            "application/json"

          },

          body:JSON.stringify({

            raffle_id:
              selectedRaffle,

            prize_cost:
              prize,

            fixed_costs:
              fixed,

            marketing_percent:
              marketing,

            influencer_percent:
              influencer,

            flow_percent:
              flow,

            iva_percent:
              iva,

            target_profit:
              profit,

            ticket_price:
              recommendedTicket,

            required_revenue:
              requiredRevenue,

            minimum_tickets:
              minimumTickets,

            break_even_tickets:
              breakEvenTickets

          })

        }

      )

    if (!response.ok) {

      throw new Error(
        "save_error"
      )

    }

    setSaveMessage(
      "✅ Plan guardado"
    )

  }

  catch(error){

    console.error(error)

    setSaveMessage(
      "❌ Error guardando"
    )

  }

  finally{

    setSaving(false)

  }

}

async function loadExtraPrizes(

  raffleId:string

){

  try{

    const response =
      await fetch(

`/api/internal/raffles/financial-extra-prizes?raffle_id=${raffleId}`

      )

    const json =
      await response.json()

    setExtraPrizes(
      json.prizes || []
    )

  }

  catch(error){

    console.error(error)

  }

}

async function loadScenarios(

  raffleId:string

){

  try{

    const response =
      await fetch(

`/api/internal/raffles/prize-scenarios/${raffleId}`

      )

    const json =
      await response.json()

    setScenarioData(
      json
    )

  }

  catch(error){

    console.error(error)

  }

}

async function createExtraPrize(){

console.log({

  selectedRaffle,

  extraPrizeName,

  extraPrizeCost

})

  if(
    !selectedRaffle ||
    !extraPrizeName ||
    !extraPrizeCost
  ){
    return
  }

  try{

   const response =
  await fetch(

"/api/internal/raffles/financial-extra-prizes",

    {

      method:"POST",

      headers:{

        "Content-Type":
        "application/json"

      },

      body:JSON.stringify({

        raffle_id:
          selectedRaffle,

        name:
          extraPrizeName,

        cost:
          Number(
            extraPrizeCost
          )

      })

    }

  )

const json =
  await response.json()

console.log(
  "CREATE EXTRA PRIZE RESPONSE =>",
  json
)

if (!response.ok) {

  alert(
    JSON.stringify(
      json,
      null,
      2
    )
  )

  return
}
        
    setExtraPrizeName("")
    setExtraPrizeCost("")

    await loadExtraPrizes(
      selectedRaffle
    )

    await loadScenarios(
      selectedRaffle
    )

  }

  catch(error){

    console.error(error)

  }

}

async function deleteExtraPrize(

  id:string

){

  try{

    await fetch(

`/api/internal/raffles/financial-extra-prizes/${id}`,

      {

        method:"DELETE"

      }

    )

    await loadExtraPrizes(
      selectedRaffle
    )

    await loadScenarios(
      selectedRaffle
    )

  }

  catch(error){

    console.error(error)

  }

}

async function loadFinancialProgress(

  raffleId:string

){

  try{

    const response =
      await fetch(

`/api/internal/raffles/financial-plan-progress/${raffleId}`

      )

    const json =
      await response.json()

    setProgressData(
      json
    )

  }

  catch(error){

    console.error(error)

  }

}

  return (

    <div className="p-8 space-y-8">

      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-bold text-white">
          🎟️ Sorteos ImpulsaSueños
        </h1>

        <p className="text-slate-400 mt-2">
          Centro de administración del sistema de sorteos
        </p>

      </div>

      {/* QUICK ACCESS */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          xl:grid-cols-4
          2xl:grid-cols-6
          gap-4
        "
      >

        {sections.map(section => (

          <Link
            key={section.href}
            href={section.href}
            className={`
              rounded-2xl
              border
              p-4
              transition-all
              hover:border-blue-500

              ${
                section.featured
                  ? "border-blue-700 bg-blue-950/20"
                  : "border-slate-800 bg-slate-900"
              }
            `}
          >

            <div className="text-3xl">
              {section.icon}
            </div>

            <h3
              className="
                mt-3
                text-lg
                font-semibold
                text-white
              "
            >
              {section.title}
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              {section.description}
            </p>

          </Link>

        ))}

      </div>

{
dashboardData && (

<div
  className="
    rounded-3xl
    border
    border-slate-800
    bg-slate-900
    p-6
  "
>

  <div
    className="
      flex
      items-center
      justify-between
      mb-6
    "
  >

    <div>

      <h2
        className="
          text-2xl
          font-bold
          text-white
        "
      >
        📊 Dashboard Ejecutivo
      </h2>

      <p
        className="
          text-slate-400
          mt-2
        "
      >
        Estado global del negocio de sorteos
      </p>

    </div>

  </div>

  <div
    className="
      grid
      md:grid-cols-2
      xl:grid-cols-4
      gap-4
    "
  >

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Facturación
      </div>

      <div className="text-2xl font-bold mt-2">
        $
        {Number(
          dashboardData.revenue || 0
        ).toLocaleString("es-CL")}
      </div>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Pagos
      </div>

      <div className="text-2xl font-bold mt-2">
        {dashboardData.payments || 0}
      </div>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Tickets Vendidos
      </div>

      <div className="text-2xl font-bold mt-2">
        {dashboardData.tickets || 0}
      </div>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Conversión
      </div>

      <div className="text-2xl font-bold mt-2">
        {Number(
          dashboardData.conversionRate || 0
        ).toFixed(1)}
        %
      </div>

    </div>

  </div>

  <div
    className="
      grid
      md:grid-cols-2
      xl:grid-cols-3
      gap-4
      mt-4
    "
  >

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Visitas
      </div>

      <div className="text-2xl font-bold mt-2">
        {dashboardData.visits || 0}
      </div>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Ticket Promedio
      </div>

      <div className="text-2xl font-bold mt-2">
        $
        {Number(
          dashboardData.avgOrderValue || 0
        ).toLocaleString("es-CL")}
      </div>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        Ingreso por Visita
      </div>

      <div className="text-2xl font-bold mt-2">
        $
        {Number(
          dashboardData.revenuePerVisit || 0
        ).toLocaleString("es-CL")}
      </div>

    </div>

  </div>

</div>

)
}

{/* FINANCIAL PLANNER */}

<div
  className="
    rounded-3xl
    border
    border-slate-800
    bg-slate-900
    p-6
    space-y-6
  "
>

  <div>

    <h2
      className="
        text-2xl
        font-bold
        text-white
      "
    >
      💰 Financial Planner
    </h2>

    <p className="text-slate-400 mt-2">
      Simulación financiera para nuevos sorteos
    </p>

<div className="mt-4">

  <label
    className="
      text-sm
      text-slate-400
    "
  >
    Sorteo
  </label>

  <select

    value={
      selectedRaffle
    }

    onChange={(e)=>{

  const raffleId =
    e.target.value

  setSelectedRaffle(
    raffleId
  )

  loadFinancialPlan(
    raffleId
  )

}}

    className="
      mt-2
      w-full
      rounded-xl
      bg-slate-950
      border
      border-slate-700
      px-4
      py-3
    "
  >

    <option value="">
      Seleccionar sorteo
    </option>

    {

      raffles.map(
        raffle => (

          <option
            key={raffle.id}
            value={raffle.id}
          >

            {raffle.title}

          </option>

        )
      )

    }

  </select>

</div>

  </div>

  <div
    className="
      grid
      md:grid-cols-2
      xl:grid-cols-4
      gap-4
    "
  >

    <div>

      <label className="text-sm text-slate-400">
        Premio Principal
      </label>

      <input
        value={prizeValue}
        onChange={(e)=>
          setPrizeValue(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

      <label className="text-sm text-slate-400">
        Costos Fijos
      </label>

      <input
        value={fixedCosts}
        onChange={(e)=>
          setFixedCosts(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

      <label className="text-sm text-slate-400">
        Marketing %
      </label>

      <input
        value={marketingPercent}
        onChange={(e)=>
          setMarketingPercent(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

      <label className="text-sm text-slate-400">
        Influencers %
      </label>

      <input
        value={influencerPercent}
        onChange={(e)=>
          setInfluencerPercent(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

      <label className="text-sm text-slate-400">
        Flow %
      </label>

      <input
        value={flowPercent}
        onChange={(e)=>
          setFlowPercent(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

      <label className="text-sm text-slate-400">
        IVA %
      </label>

      <input
        value={ivaPercent}
        onChange={(e)=>
          setIvaPercent(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

    <div>

<label className="text-sm text-slate-400">
Impuesto Anual %
</label>

<input
value={taxReservePercent}
onChange={(e)=>
setTaxReservePercent(
e.target.value
)
}
className="
w-full
mt-2
rounded-xl
bg-slate-950
border
border-slate-700
px-4
py-3
"
/>

</div>

        <div>

      <label className="text-sm text-slate-400">
        Utilidad Objetivo
      </label>

      <input
        value={targetProfit}
        onChange={(e)=>
          setTargetProfit(
            e.target.value
          )
        }
        className="
          w-full
          mt-2
          rounded-xl
          bg-slate-950
          border
          border-slate-700
          px-4
          py-3
        "
      />

    </div>

  </div>

  <div
    className="
      grid
      md:grid-cols-2
      xl:grid-cols-4
      gap-4
    "
  >

    <div
      className="
        rounded-2xl
        bg-slate-950
        border
        border-slate-800
        p-5
      "
    >

      <p className="text-slate-400 text-sm">
        Facturación Objetivo
      </p>

      <p className="text-2xl font-bold mt-2">
        $
        {Math.round(
          requiredRevenue
        ).toLocaleString("es-CL")}
      </p>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        border
        border-slate-800
        p-5
      "
    >

      <p className="text-slate-400 text-sm">
        Ticket Recomendado
      </p>

      <p className="text-2xl font-bold mt-2">
        $
        {recommendedTicket.toLocaleString("es-CL")}
      </p>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        border
        border-slate-800
        p-5
      "
    >

      <p className="text-slate-400 text-sm">
        Tickets Necesarios
      </p>

      <p className="text-2xl font-bold mt-2">
        {minimumTickets.toLocaleString("es-CL")}
      </p>

    </div>

    <div
      className="
        rounded-2xl
        bg-slate-950
        border
        border-slate-800
        p-5
      "
    >

      <p className="text-slate-400 text-sm">
        Punto de Equilibrio
      </p>

      <p className="text-2xl font-bold mt-2">
        {breakEvenTickets.toLocaleString("es-CL")}
      </p>

    </div>

    <div
className="
rounded-2xl
bg-emerald-950
border
border-emerald-800
p-5
"
>

<p className="text-slate-300 text-sm">
Caja Libre Proyectada
</p>

<p className="text-2xl font-bold mt-2 text-emerald-400">
$
{Math.round(
projectedFreeCash
).toLocaleString("es-CL")}
</p>

</div>

  </div>

<div
className="
grid
md:grid-cols-2
xl:grid-cols-5
gap-4
"
>

<div
className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"
>

<p className="text-slate-400 text-sm">
Marketing
</p>

<p className="text-sm">
{marketing}%
</p>

<p className="text-xl font-bold mt-2">
$
{Math.round(
marketingAmount
).toLocaleString("es-CL")}
</p>

</div>

<div
className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"
>

<p className="text-slate-400 text-sm">
Influencers
</p>

<p className="text-sm">
{influencer}%
</p>

<p className="text-xl font-bold mt-2">
$
{Math.round(
influencerAmount
).toLocaleString("es-CL")}
</p>

</div>

<div
className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"
>

<p className="text-slate-400 text-sm">
Flow
</p>

<p className="text-sm">
{flow}%
</p>

<p className="text-xl font-bold mt-2">
$
{Math.round(
flowAmount
).toLocaleString("es-CL")}
</p>

</div>

<div
className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"
>

<p className="text-slate-400 text-sm">
IVA
</p>

<p className="text-sm">
{iva}%
</p>

<p className="text-xl font-bold mt-2">
$
{Math.round(
ivaAmount
).toLocaleString("es-CL")}
</p>

</div>

<div
className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"
>

<p className="text-slate-400 text-sm">
Reserva Impuesto
</p>

<p className="text-sm">
{taxReserve}%
</p>

<p className="text-xl font-bold mt-2">
$
{Math.round(
taxReserveAmount
).toLocaleString("es-CL")}
</p>

</div>

</div>

<div
  className="
    flex
    items-center
    gap-4
    pt-4
  "
>

  <button

    onClick={
      saveFinancialPlan
    }

    disabled={
      saving
    }

    className="
      px-6
      py-3
      rounded-xl
      bg-emerald-600
      hover:bg-emerald-500
      text-white
      font-semibold
      disabled:opacity-50
    "

  >

    {

      saving

      ?

      "Guardando..."

      :

      "💾 Guardar Plan"

    }

  </button>

  {

    saveMessage && (

      <div
        className="
          text-sm
          text-slate-300
        "
      >

        {saveMessage}

      </div>

    )

  }

</div>

</div>

{
progressData?.exists && (

<div
className="
rounded-3xl
border
border-emerald-900
bg-emerald-950/20
p-6
"
>

<h2
className="
text-2xl
font-bold
text-white
mb-5
"
>

📊 Avance Financiero

</h2>

<div
className="
grid
md:grid-cols-2
xl:grid-cols-5
gap-4
"
>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">

Ventas Reales

</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.revenue || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">

Tickets Vendidos

</div>

<div className="text-2xl font-bold mt-2">

{progressData.soldTickets || 0}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">

Meta Financiera

</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.requiredRevenue || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">

Avance

</div>

<div className="text-2xl font-bold mt-2">

{

Number(

progressData.progress || 0

).toFixed(1)

}

%

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">

Utilidad Proyectada

</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.projectedProfit || 0

).toLocaleString("es-CL")}

</div>

</div>

</div>

<div
className="
grid
md:grid-cols-2
xl:grid-cols-5
gap-4
mt-5
"
>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">
🎯 Faltante Meta
</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.remainingRevenue || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">
🎟 Tickets Faltantes
</div>

<div className="text-2xl font-bold mt-2">

{Number(

progressData.remainingTickets || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">
🚀 Exceso sobre Meta
</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.surplusRevenue || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">
💰 Caja Disponible
</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.availableCash || 0

).toLocaleString("es-CL")}

</div>

</div>

<div
className="
bg-slate-900
rounded-2xl
p-4
"
>

<div className="text-slate-400 text-sm">
🎁 Premio Extra Posible
</div>

<div className="text-2xl font-bold mt-2">

$

{Number(

progressData.extraPrizeCapacity || 0

).toLocaleString("es-CL")}

</div>

</div>

</div>

</div>

)
}

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
space-y-6
"
>

<div>

<h2
className="
text-2xl
font-bold
text-white
"
>

🎁 Premios Adicionales

</h2>

<p className="text-slate-400 mt-2">

Premios que podrían agregarse si el sorteo supera la meta financiera.

</p>

</div>

<div
className="
grid
md:grid-cols-3
gap-4
"
>

<input

value={extraPrizeName}

onChange={(e)=>
setExtraPrizeName(
e.target.value
)
}

placeholder="Nombre premio"

className="
rounded-xl
bg-slate-950
border
border-slate-700
px-4
py-3
"

/>

<input

value={extraPrizeCost}

onChange={(e)=>
setExtraPrizeCost(
e.target.value
)
}

placeholder="Costo"

className="
rounded-xl
bg-slate-950
border
border-slate-700
px-4
py-3
"

/>

<button

onClick={
createExtraPrize
}

className="
rounded-xl
bg-blue-600
hover:bg-blue-500
font-semibold
"

>

➕ Agregar Premio

</button>

</div>

<div
className="
overflow-x-auto
rounded-2xl
border
border-slate-800
"
>

<table className="w-full">

<thead>

<tr
className="
border-b
border-slate-800
bg-slate-950
"
>

<th className="p-4 text-left">

Premio

</th>

<th className="p-4 text-left">

Costo

</th>

<th className="p-4 text-left">

Acción

</th>

</tr>

</thead>

<tbody>

{

extraPrizes.length === 0

?

<tr>

<td
colSpan={3}
className="p-6 text-center text-slate-500"
>

Sin premios adicionales

</td>

</tr>

:

extraPrizes.map(
(item:any)=>(
<tr
key={item.id}
className="
border-b
border-slate-800
"
>

<td className="p-4">

{item.name}

</td>

<td className="p-4">

$

{Number(
item.cost || 0
).toLocaleString("es-CL")}

</td>

<td className="p-4">

<button

onClick={()=>
deleteExtraPrize(
item.id
)
}

className="
px-3
py-2
rounded-lg
bg-red-600
hover:bg-red-500
text-sm
"

>

Eliminar

</button>

</td>

</tr>
)
)

}

</tbody>

</table>

</div>

{
scenarioData?.scenarios?.length > 0 && (

<div
className="
rounded-2xl
border
border-slate-800
bg-slate-950
p-5
"
>

<h3
className="
text-lg
font-semibold
mb-4
"
>

📊 Escenarios Posibles

</h3>

<div className="space-y-3">

{

scenarioData.scenarios.map(
(item:any)=>(

<div
key={item.id}
className="
flex
items-center
justify-between
border-b
border-slate-800
pb-3
"
>

<div>

<div className="font-medium">

{item.name}

</div>

<div className="text-sm text-slate-400">

$

{Number(
item.cost || 0
).toLocaleString("es-CL")}

</div>

</div>

<div>

{

item.possible

?

<span
className="
px-3
py-1
rounded-full
bg-emerald-600
text-white
text-sm
"
>

✅ Posible

</span>

:

<span
className="
px-3
py-1
rounded-full
bg-red-600
text-white
text-sm
"
>

❌ No posible

</span>

}

</div>

</div>

)
)

}

</div>

</div>

)

}
</div>

      {/* SYSTEM CARD */}

      <div
        className="
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-900
          to-slate-950
          p-6
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
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              System
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-2
              "
            >
              🛡️ Monitor del Sistema
            </h2>

            <p
              className="
                mt-2
                text-slate-400
              "
            >
              Estado general de pagos, tickets, webhooks y procesos automáticos.
            </p>

          </div>

          <Link
            href="/admin/raffles/system"
            className="
              px-6
              py-3
              rounded-xl
              bg-white
              text-slate-900
              font-semibold
              hover:bg-slate-200
              transition
            "
          >
            Abrir Monitor
          </Link>

        </div>

      </div>

    </div>

  )
}
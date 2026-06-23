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

const profit =
Number(targetProfit || 0)

const totalPercentCosts =
marketing +
influencer +
flow +
iva

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

}, [])

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

  if(
    !selectedRaffle ||
    !extraPrizeName ||
    !extraPrizeCost
  ){
    return
  }

  try{

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
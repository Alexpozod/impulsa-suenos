"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function AffiliateDetailPage() {

const { id } =
useParams()

const [loading,setLoading]=
useState(true)

const [data,setData]=
useState<any>(null)

useEffect(()=>{

load()

},[])

async function load(){

const res=
await fetch(
`/api/admin/raffles/affiliates/${id}`
)

const json=
await res.json()

setData(json)

setLoading(false)

}

if(loading){

return(

<div className="p-8">

Cargando...

</div>

)

}

return(

<div className="space-y-8 p-8">

{/* HEADER */}

<div className="flex items-center justify-between">

<div>

<h1 className="text-4xl font-bold">

Influencer

</h1>

<p className="text-slate-400 mt-2">

{data?.affiliate?.owner_name}

</p>

</div>

<div>

<span
className={
data?.affiliate?.active
?
"px-4 py-2 rounded-full bg-emerald-600"
:
"px-4 py-2 rounded-full bg-red-600"
}
>

{

data?.affiliate?.active

?

"Activo"

:

"Inactivo"

}

</span>

</div>

</div>

{/* TARJETAS */}

<div className="grid xl:grid-cols-4 gap-5">

<Card
title="Código"
value={
data?.affiliate?.code
}
/>

<Card
title="Comisión"
value={`${data?.affiliate?.commissionPercent}%`}
/>

<Card
title="Clicks"
value={
data?.stats?.clicks
}
/>

<Card
title="Ventas"
value={
data?.stats?.paidOrders
}
/>

<Card
title="Revenue"
value={`$${Number(
data?.stats?.revenue??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Comisión Generada"
value={`$${Number(
data?.wallet?.generated??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Disponible"
value={`$${Number(
data?.wallet?.available??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Pagado"
value={`$${Number(
data?.wallet?.paid??0
).toLocaleString("es-CL")}`}
/>

</div>

{/* INFORMACIÓN */}

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-8
space-y-6
">

<h2 className="text-2xl font-semibold">

Información

</h2>

<Row
label="Código"
value={data?.affiliate?.code}
/>

<Row
label="Email"
value={data?.affiliate?.email}
/>

<Row
label="Comisión"
value={`${data?.affiliate?.commissionPercent}%`}
/>

<Row
label="Estado"
value={
data?.affiliate?.active
?
"Activo"
:
"Inactivo"
}
/>

<Row
label="Sorteo"
value={
data?.affiliate?.raffle?.title
??
"Todos"
}
/>

<div>

<div className="text-slate-400 mb-2">

Enlace

</div>

<div className="font-mono break-all">

{`${window.location.origin}/raffles?aff=${data?.affiliate?.code}`}

</div>

</div>

<div className="flex gap-3">

<button
className="px-5 py-3 rounded-xl bg-slate-800"
onClick={()=>{

navigator.clipboard.writeText(
data?.affiliate?.code
)

}}
>

Copiar código

</button>

<button
className="px-5 py-3 rounded-xl bg-slate-800"
onClick={()=>{

navigator.clipboard.writeText(
`${window.location.origin}/raffles?aff=${data?.affiliate?.code}`
)

}}
>

Copiar enlace

</button>

<button
className="px-5 py-3 rounded-xl bg-emerald-600"
onClick={()=>{

window.open(
`${window.location.origin}/raffles?aff=${data?.affiliate?.code}`
)

}}
>

Abrir enlace

</button>

</div>

</div>

{/* WALLET */}

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-8
">

<h2 className="text-2xl font-semibold mb-6">

Wallet del Influencer

</h2>

<div className="grid xl:grid-cols-4 gap-5">

<Card
title="Generado"
value={`$${Number(
data?.wallet?.generated??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Disponible"
value={`$${Number(
data?.wallet?.available??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Pendiente"
value={`$${Number(
data?.wallet?.pending??0
).toLocaleString("es-CL")}`}
/>

<Card
title="Pagado"
value={`$${Number(
data?.wallet?.paid??0
).toLocaleString("es-CL")}`}
/>

</div>

</div>

{/* LEDGER */}

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
overflow-hidden
">

<div className="p-6 text-2xl font-semibold">

Ledger

</div>

<table className="w-full">

<thead>

<tr className="border-b border-slate-800">

<th className="text-left p-4">

Tipo

</th>

<th className="text-left">

Monto

</th>

<th className="text-left">

Fecha

</th>

</tr>

</thead>

<tbody>

{

(data?.ledger??[]).map((item:any)=>(

<tr
key={item.id}
className="border-b border-slate-800"
>

<td className="p-4">

{item.type}

</td>

<td>

${Number(
item.amount_clp
).toLocaleString("es-CL")}

</td>

<td>

{

new Date(
item.created_at
).toLocaleString("es-CL")

}

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

)

}

function Card({

title,

value

}:any){

return(

<div
className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-6
">

<div className="text-slate-400">

{title}

</div>

<div className="text-3xl font-bold mt-4">

{value}

</div>

</div>

)

}

function Row({

label,

value

}:any){

return(

<div>

<div className="text-slate-400">

{label}

</div>

<div className="mt-1">

{value}

</div>

</div>

)

}
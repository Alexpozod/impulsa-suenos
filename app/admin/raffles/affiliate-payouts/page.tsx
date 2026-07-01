"use client"

import { useEffect,useState } from "react"

export default function AffiliatePayoutsPage(){

const [loading,setLoading]=
useState(true)

const [requests,setRequests]=
useState<any[]>([])

useEffect(()=>{

load()

},[])

async function load(){

setLoading(true)

try{

const res=
await fetch(
"/api/admin/raffles/affiliate-payouts"
)

const json=
await res.json()

setRequests(
json.requests||[]
)

}

finally{

setLoading(false)

}

}

return(

<div className="space-y-6">

<div>

<h1 className="text-3xl font-bold">

💰 Retiros Influencers

</h1>

<p className="text-slate-400 mt-2">

Solicitudes de pago pendientes e históricas

</p>

</div>

<div
className="
bg-slate-900
border
border-slate-800
rounded-3xl
overflow-hidden
"
>

<table className="w-full">

<thead
className="bg-slate-950"
>

<tr>

<th className="p-4 text-left">

Código

</th>

<th className="p-4 text-left">

Email

</th>

<th className="p-4 text-left">

Monto

</th>

<th className="p-4 text-left">

Estado

</th>

<th className="p-4 text-left">

Fecha

</th>

<th className="p-4 text-left">

Acción

</th>

</tr>

</thead>

<tbody>

{

loading &&

<tr>

<td
colSpan={6}
className="p-8"
>

Cargando...

</td>

</tr>

}

{

!loading &&

requests.length===0 &&

<tr>

<td
colSpan={6}
className="p-8"
>

Sin solicitudes

</td>

</tr>

}

{

requests.map((item:any)=>(

<tr
key={item.id}
className="
border-b
border-slate-800
"
>

<td className="p-4">

{

item
.affiliate
?.code

??

"-"

}

</td>

<td className="p-4">

{

item
.affiliate
?.owner_email

??

"-"

}

</td>

<td className="p-4">

$

{

Number(
item.amount_clp||0
)

.toLocaleString("es-CL")

}

</td>

<td className="p-4">

{

item.status

}

</td>

<td className="p-4">

{

item.created_at

?

new Date(

item.created_at

)

.toLocaleString("es-CL")

:

"-"

}

</td>

<td className="p-4">

<div className="flex gap-2">

<button

disabled={
item.status!=="pending"
}

onClick={async()=>{

await fetch(

`/api/admin/raffles/affiliate-payouts/${item.id}/approve`,

{

method:"POST"

}

)

load()

}}

className="
px-3
py-2
rounded-xl
bg-green-600
hover:bg-green-500
disabled:opacity-50
text-sm
"

>

Aprobar

</button>

<button

disabled={
item.status!=="pending"
}

onClick={async()=>{

await fetch(

`/api/admin/raffles/affiliate-payouts/${item.id}/reject`,

{

method:"POST"

}

)

load()

}}

className="
px-3
py-2
rounded-xl
bg-red-600
hover:bg-red-500
disabled:opacity-50
text-sm
"

>

Rechazar

</button>

</div>

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
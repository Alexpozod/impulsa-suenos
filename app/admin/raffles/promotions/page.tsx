"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PromotionsPage() {

const [rules,setRules] =
useState<any[]>([])

const [loading,setLoading] =
useState(true)

useEffect(()=>{

loadRules()

},[])

async function loadRules(){

try{

const {
data:{session}
}
=
await supabase.auth.getSession()

const response =
await fetch(

"/api/admin/raffles/promotions",

{
headers:{
Authorization:
`Bearer ${session?.access_token}`
}
}

)

const json =
await response.json()

setRules(
json.rules || []
)

}

catch(error){

console.error(error)

}

finally{

setLoading(false)

}

}

return(

<div className="p-8 space-y-8">

<div>

<h1
className="
text-4xl
font-bold
text-white
"
>
🎁 Promociones
</h1>

<p
className="
text-slate-400
mt-2
"
>
Bundles, cupones, promociones y reglas comerciales.
</p>

</div>

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
overflow-hidden
"
>

<div
className="
px-6
py-5
border-b
border-slate-800
"
>

<h2
className="
text-xl
font-semibold
text-white
"
>
Reglas Comerciales
</h2>

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
bg-slate-950
border-b
border-slate-800
"
>

<th className="p-4 text-left">
Tipo
</th>

<th className="p-4 text-left">
Código
</th>

<th className="p-4 text-left">
Nombre
</th>

<th className="p-4 text-left">
Prioridad
</th>

<th className="p-4 text-left">
Activo
</th>

<th className="p-4 text-left">
Bonus
</th>

<th className="p-4 text-left">
Min Qty
</th>

</tr>

</thead>

<tbody>

{
loading
?

<tr>
<td
colSpan={7}
className="
p-8
text-center
text-slate-500
"
>
Cargando...
</td>
</tr>

:

rules.length === 0

?

<tr>
<td
colSpan={7}
className="
p-8
text-center
text-slate-500
"
>
Sin promociones
</td>
</tr>

:

rules.map(rule=>(

<tr
key={rule.id}
className="
border-b
border-slate-800
"
>

<td className="p-4">

{rule.type}

</td>

<td className="p-4">

{rule.code}

</td>

<td className="p-4">

{rule.name}

</td>

<td className="p-4">

{rule.priority}

</td>

<td className="p-4">

{
rule.active
?
"✅"
:
"❌"
}

</td>

<td className="p-4">

{
rule.bonus_quantity || 0
}

</td>

<td className="p-4">

{
rule.min_quantity || "-"
}

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

</div>

)

}
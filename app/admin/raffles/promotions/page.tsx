"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PromotionsPage() {

const [rules,setRules] =
useState<any[]>([])

const [loading,setLoading] =
useState(true)

const [saving,setSaving] =
useState(false)

const [type,setType] =
useState("bonus")

const [code,setCode] =
useState("")

const [name,setName] =
useState("")

const [bonusQuantity,setBonusQuantity] =
useState("1")

const [minQuantity,setMinQuantity] =
useState("1")

const [priority,setPriority] =
useState("100")

const [editingId,setEditingId] =
useState("")

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

<th className="p-4 text-left">
Acciones
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

<button
type="button"
onClick={async()=>{

try{

const {
data:{session}
}
=
await supabase.auth.getSession()

if(rule.active){

await fetch(

`/api/admin/raffles/promotions?id=${rule.id}`,

{

method:"DELETE",

headers:{

Authorization:
`Bearer ${session?.access_token}`

}

}

)

}
else{

await fetch(

"/api/admin/raffles/promotions",

{

method:"PUT",

headers:{

"Content-Type":
"application/json",

Authorization:
`Bearer ${session?.access_token}`

},

body:JSON.stringify({

...rule,

active:true

})

}

)

}

await loadRules()

}

catch(error){

console.error(error)

}

}}
className="
px-3
py-1
rounded-lg
border
border-slate-700
"
>

{
rule.active
?
"✅ Activa"
:
"❌ Inactiva"
}

</button>

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

<td className="p-4">

<button
type="button"
onClick={()=>{

setType(
rule.type || "bonus"
)

setCode(
rule.code || ""
)

setName(
rule.name || ""
)

setBonusQuantity(
String(
rule.bonus_quantity || 0
)
)

setMinQuantity(
String(
rule.min_quantity || 1
)
)

setPriority(
String(
rule.priority || 0
)
)

setEditingId(
rule.id
)

}}
className="
px-3
py-1
rounded-lg
bg-cyan-500
text-slate-950
font-semibold
"
>

Editar

</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

<div
className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
"
>

<h2
className="
text-xl
font-semibold
text-white
mb-6
"
>
{
editingId
?
"Editar Promoción"
:
"Nueva Promoción"
}
</h2>

<div
className="
grid
grid-cols-1
md:grid-cols-2
gap-4
"
>

<select
value={type}
onChange={(e)=>
setType(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
>

<option value="bonus">
Bonus
</option>

<option value="bundle">
Bundle
</option>

<option value="coupon">
Coupon
</option>

</select>

<input
placeholder="Código"
value={code}
onChange={(e)=>
setCode(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
/>

<input
placeholder="Nombre"
value={name}
onChange={(e)=>
setName(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
/>

<input
placeholder="Bonus Quantity"
value={bonusQuantity}
onChange={(e)=>
setBonusQuantity(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
/>

<input
placeholder="Min Quantity"
value={minQuantity}
onChange={(e)=>
setMinQuantity(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
/>

<input
placeholder="Priority"
value={priority}
onChange={(e)=>
setPriority(
e.target.value
)
}
className="
bg-slate-950
border
border-slate-700
rounded-xl
p-3
"
/>

</div>

<button
type="button"
disabled={saving}
onClick={async()=>{

try{

setSaving(true)

const {
data:{session}
}
=
await supabase.auth.getSession()

await fetch(

"/api/admin/raffles/promotions",

{

method:
editingId
?
"PUT"
:
"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
`Bearer ${session?.access_token}`

},

body:JSON.stringify({

id:
editingId || undefined,

type,

code,

name,

bonus_quantity:
Number(
bonusQuantity
),

min_quantity:
Number(
minQuantity
),

priority:
Number(
priority
)

})

}

)

setCode("")
setName("")

setEditingId("")

await loadRules()

}

catch(error){

console.error(error)

}

finally{

setSaving(false)

}

}}
className="
mt-6
px-6
py-3
rounded-xl
bg-cyan-500
text-slate-950
font-bold
"
>

{
saving
?
"Guardando..."
:
"Crear Promoción"
}

</button>

</div>

</div>

)

}
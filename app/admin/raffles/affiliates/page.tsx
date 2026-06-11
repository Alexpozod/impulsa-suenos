"use client"

import Link from "next/link"

export default function AffiliatesPage() {

return (

<div className="space-y-6">

<div className="flex items-center justify-between">

<div>

<h1 className="text-3xl font-bold">

⭐ Influencers

</h1>

<p className="text-slate-400 mt-2">

Administración del programa de influencers

</p>

</div>

<button
className="
bg-blue-600
hover:bg-blue-500
px-5
py-3
rounded-2xl
font-semibold
"
>

➕ Nuevo Influencer

</button>

</div>

<div
className="
bg-slate-900
border
border-slate-800
rounded-3xl
p-6
"
>

<input

placeholder="Buscar código o email"

className="
w-full
bg-slate-950
border
border-slate-700
rounded-2xl
px-4
py-3
outline-none
"

/>

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

<thead className="bg-slate-950">

<tr>

<th className="p-4 text-left">

Código

</th>

<th className="p-4 text-left">

Email

</th>

<th className="p-4 text-left">

Comisión

</th>

<th className="p-4 text-left">

Estado

</th>

<th className="p-4 text-left">

Link

</th>

<th className="p-4 text-left">

Acciones

</th>

</tr>

</thead>

<tbody>

<tr>

<td
colSpan={6}
className="
p-12
text-center
text-slate-500
"
>

No existen influencers registrados

</td>

</tr>

</tbody>

</table>

</div>

</div>

)

}
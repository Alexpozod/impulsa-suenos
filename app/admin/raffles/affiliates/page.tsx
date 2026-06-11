"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function AffiliatesPage() {

    const [loading, setLoading] =
useState(true)

const [affiliates, setAffiliates] =
useState<any[]>([])

const [code, setCode] =
useState("")

const [email, setEmail] =
useState("")

const [commission, setCommission] =
useState("10")

const [saving, setSaving] =
useState(false)

useEffect(() => {

  load()

}, [])

async function load() {

  try {

    setLoading(true)

    const res =
      await fetch(
        "/api/admin/raffles/affiliates"
      )

    const json =
      await res.json()

    setAffiliates(
      json.affiliates || []
    )

  }

  finally {

    setLoading(false)

  }

}

async function createAffiliate() {

  try {

    setSaving(true)

    const res =
      await fetch(
        "/api/admin/raffles/affiliates",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            code,

            owner_email: email,

            commission_percent:
              Number(commission)

          })

        }
      )

    const json =
      await res.json()

    if (!res.ok) {

      alert(
        json.error ||
        "Error"
      )

      return

    }

    setCode("")
    setEmail("")
    setCommission("10")

    await load()

  }

  catch (e) {

    console.error(e)

    alert(
      "Error inesperado"
    )

  }

  finally {

    setSaving(false)

  }

}

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

</div>

<div
className="
bg-slate-900
border
border-slate-800
rounded-3xl
p-6
space-y-4
"
>

<div className="font-bold">

Nuevo Influencer

</div>

<div
className="
grid
md:grid-cols-3
gap-3
"
>

<input

value={code}

onChange={(e)=>
setCode(e.target.value)
}

placeholder="Código"

className="
bg-slate-950
border
border-slate-700
rounded-2xl
px-4
py-3
"

/>

<input

value={email}

onChange={(e)=>
setEmail(e.target.value)
}

placeholder="Email"

className="
bg-slate-950
border
border-slate-700
rounded-2xl
px-4
py-3
"

/>

<input

value={commission}

onChange={(e)=>
setCommission(e.target.value)
}

placeholder="Comisión %"

className="
bg-slate-950
border
border-slate-700
rounded-2xl
px-4
py-3
"

/>

</div>

<div className="flex gap-3">

<button

onClick={createAffiliate}

disabled={saving}

className="
bg-blue-600
hover:bg-blue-500
px-5
py-3
rounded-2xl
font-semibold
disabled:opacity-50
"

>

{

saving

?

"Guardando..."

:

"➕ Crear Influencer"

}

</button>

</div>

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

{loading && (

<tr>

<td
colSpan={6}
className="p-10 text-center text-slate-500"
>

Cargando...

</td>

</tr>

)}

{!loading &&
affiliates.length===0 && (

<tr>

<td
colSpan={6}
className="p-10 text-center text-slate-500"
>

No existen influencers registrados

</td>

</tr>

)}

{!loading &&
affiliates.map((item)=>(

<tr
key={item.id}
className="border-b border-slate-800"
>

<td className="p-4 font-semibold">

{item.code}

</td>

<td className="p-4">

{item.owner_email}

</td>

<td className="p-4">

{item.commission_percent}%

</td>

<td className="p-4">

{item.active
? "🟢 Activo"
: "🔴 Inactivo"}

</td>

<td className="p-4 text-xs">

{`/raffles?aff=${item.code}`}

</td>

<td className="p-4">

<button
className="
px-3
py-2
rounded-xl
bg-slate-800
hover:bg-slate-700
text-sm
"
>

Copiar

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}
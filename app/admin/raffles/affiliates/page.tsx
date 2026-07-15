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

const [bonus1, setBonus1] =
useState("1")

const [bonus3, setBonus3] =
useState("2")

const [bonus5, setBonus5] =
useState("5")

const [saving, setSaving] =
useState(false)

const [editingId, setEditingId] =
useState("")

const [active, setActive] =
useState(true)

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

      editingId

      ? `/api/admin/raffles/affiliates/${editingId}/update`

      : "/api/admin/raffles/affiliates",
        {
          method:

          editingId

          ? "PUT"

          : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            code,

            owner_email: email,

            commission_percent:
            Number(commission),

            bonus_quantity_1:
            Number(bonus1),

            bonus_quantity_3:
            Number(bonus3),

            bonus_quantity_5:
            Number(bonus5),

            active

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
    setBonus1("1")

    setBonus3("2")

    setBonus5("5")

    setEditingId("")

    setActive(true)

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
md:grid-cols-6
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

<input

value={bonus1}

onChange={(e)=>
setBonus1(e.target.value)
}

placeholder="Bonus compra 1"

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

value={bonus3}

onChange={(e)=>
setBonus3(e.target.value)
}

placeholder="Bonus compra 3"

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

value={bonus5}

onChange={(e)=>
setBonus5(e.target.value)
}

placeholder="Bonus compra 5"

className="
bg-slate-950
border
border-slate-700
rounded-2xl
px-4
py-3
"
/>

<div
className="
flex
items-center
gap-3
"
>

<input

type="checkbox"

checked={active}

onChange={(e)=>
setActive(
e.target.checked
)
}

/>

<label>

Influencer activo

</label>

</div>

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

editingId

?

"💾 Guardar cambios"

:

"➕ Crear Influencer"

}

</button>

{

editingId && (

<button

onClick={()=>{

setEditingId("")

setCode("")

setEmail("")

setCommission("10")

setBonus1("1")

setBonus3("2")

setBonus5("5")

setActive(true)

}}

className="
bg-slate-700
hover:bg-slate-600
px-5
py-3
rounded-2xl
font-semibold
"

>

Cancelar

</button>

)

}

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

<th className="p-4 text-center">

+1

</th>

<th className="p-4 text-center">

+3

</th>

<th className="p-4 text-center">

+5

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
colSpan={9}
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
colSpan={9}
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

<td className="p-4 text-center">

+{item.bonus_quantity_1}

</td>

<td className="p-4 text-center">

+{item.bonus_quantity_3}

</td>

<td className="p-4 text-center">

+{item.bonus_quantity_5}

</td>

<td className="p-4">

{item.active
? "🟢 Activo"
: "🔴 Inactivo"}

</td>

<td className="p-4 text-xs break-all">

{

item.shareUrl ??

`https://sorteos.impulsasuenos.com/r/${item.code}`

}

</td>

<td className="p-4">

<div className="flex flex-wrap gap-2">

<div className="flex flex-wrap gap-2">

{

(item.raffleLinks ?? []).map(

(raffle:any)=>(

<button

key={raffle.id}

onClick={()=>{

navigator.clipboard.writeText(

raffle.url

)

}}

className="
px-3
py-2
rounded-xl
bg-indigo-700
hover:bg-indigo-600
text-xs
"

>

🎟 {raffle.title}

</button>

)

)

}

</div>

<button

onClick={()=>{

setEditingId(
item.id
)

setCode(
item.code
)

setEmail(
item.owner_email
)

setCommission(
String(
item.commission_percent
)
)

setBonus1(
String(
item.bonus_quantity_1 ?? 0
)
)

setBonus3(
String(
item.bonus_quantity_3 ?? 0
)
)

setBonus5(
String(
item.bonus_quantity_5 ?? 0
)
)

setActive(
item.active
)

window.scrollTo({

top:0,

behavior:"smooth"

})

}}

className="
px-4
py-2
rounded-xl
bg-amber-600
hover:bg-amber-500
text-white
font-medium
text-sm
transition-colors
"

>

✏️ Editar

</button>

<Link

href={`/admin/raffles/affiliates/${item.id}`}

className="
px-4
py-2
rounded-xl
bg-sky-600
hover:bg-sky-500
text-white
font-medium
text-sm
transition-colors
"

>

Detalle

</Link>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}
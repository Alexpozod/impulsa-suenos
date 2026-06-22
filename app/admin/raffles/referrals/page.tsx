"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function ReferralsPage(){

const [loading,setLoading]=
useState(true)

const [items,setItems]=
useState<any[]>([])

const [code,setCode]=
useState("")

const [email,setEmail]=
useState("")

const [rewardType,setRewardType]=
useState("percentage")

const [rewardValue,setRewardValue]=
useState("5")

const [saving,setSaving]=
useState(false)

useEffect(()=>{

load()

},[])

async function load(){

setLoading(true)

const res=

await fetch(

"/api/admin/raffles/referrals"

)

const json=

await res.json()

setItems(

json.referrals||[]

)

setLoading(false)

}

async function createReferral(){

setSaving(true)

const res=

await fetch(

"/api/admin/raffles/referrals",

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

code,

owner_email:email,

reward_type:

rewardType,

reward_value:

Number(

rewardValue

)

})

}

)

if(res.ok){

setCode("")

setEmail("")

setRewardValue("5")

await load()

}

setSaving(false)

}

return(

<div className="space-y-6">

<h1 className="text-3xl font-bold">

🎁 Referidos

</h1>

<div
className="bg-slate-900 rounded-3xl p-6 space-y-4"
>

<div
className="grid md:grid-cols-4 gap-3"
>

<input

value={code}

onChange={e=>

setCode(

e.target.value

)

}

placeholder="Código"

className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3"

/>

<input

value={email}

onChange={e=>

setEmail(

e.target.value

)

}

placeholder="Email"

className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3"

/>

<select

value={rewardType}

onChange={e=>

setRewardType(

e.target.value

)

}

className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3"

>

<option value="percentage">

Porcentaje

</option>

<option value="amount">

Monto

</option>

</select>

<input

value={rewardValue}

onChange={e=>

setRewardValue(

e.target.value

)

}

placeholder="Valor"

className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3"

/>

</div>

<button

onClick={createReferral}

disabled={saving}

className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-2xl"

>

{

saving

?

"Guardando..."

:

"➕ Crear Referido"

}

</button>

</div>

<div
className="bg-slate-900 rounded-3xl overflow-hidden"
>

<table className="w-full">

<thead>

<tr>

<th className="p-4 text-left">

Código

</th>

<th className="p-4 text-left">

Email

</th>

<th className="p-4 text-left">

Reward

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

{

loading&&(

<tr>

<td
colSpan={5}

className="p-6"

>

Cargando...

</td>

</tr>

)

}

{

!loading&&

items.map(

(item:any)=>(

<tr
key={item.id}
className="border-t border-slate-800"
>

<td className="p-4">

{item.code}

</td>

<td className="p-4">

{item.owner_email}

</td>

<td className="p-4">

{item.reward_value}

{

item.reward_type==="percentage"

?

"%"

:

" CLP"

}

</td>

<td className="p-4 text-xs break-all">

  {item.shareUrl}

</td>

<td className="p-4">

  <div className="flex gap-2 flex-wrap">

    <Link

      href={`/admin/raffles/referrals/${item.id}`}

      className="
      px-3
      py-2
      rounded-xl
      bg-blue-600
      hover:bg-blue-500
      text-sm
      "

    >

      Detalle

    </Link>

    <button

      onClick={()=>

        navigator.clipboard.writeText(

          item.code

        )

      }

      className="
      px-3
      py-2
      rounded-xl
      bg-slate-700
      hover:bg-slate-600
      text-sm
      "

    >

      📋 Código

    </button>

    <button

      onClick={()=>

        navigator.clipboard.writeText(

          item.shareUrl

        )

      }

      className="
      px-3
      py-2
      rounded-xl
      bg-slate-700
      hover:bg-slate-600
      text-sm
      "

    >

      🔗 Link

    </button>

  </div>

</td>

</tr>

)

)

}

</tbody>

</table>

</div>

</div>

)

}
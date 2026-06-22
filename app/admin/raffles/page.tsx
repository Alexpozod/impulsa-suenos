"use client"

import Link from "next/link"

export default function AdminRafflesPage() {
    
  return (

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          🎟️ Raffles Admin
        </h1>

        <p className="text-slate-400 mt-2">
  Dashboard principal de sorteos
</p>

      </div>

      <div
className="
grid
grid-cols-2
md:grid-cols-3
xl:grid-cols-6
gap-4
"
>

<a
href="/admin/raffles/create"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
➕
</div>

<div className="mt-3 font-bold">
Crear Sorteo
</div>
</a>

<a
href="/admin/raffles/manage"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🎟️
</div>

<div className="mt-3 font-bold">
Gestionar
</div>
</a>

<a
href="/admin/raffles/orders"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🛒
</div>

<div className="mt-3 font-bold">
Órdenes
</div>
</a>

<a
href="/admin/raffles/payments"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
💳
</div>

<div className="mt-3 font-bold">
Pagos
</div>
</a>

<a
href="/admin/raffles/tickets"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🎫
</div>

<div className="mt-3 font-bold">
Tickets
</div>
</a>

<a
href="/admin/raffles/results"
className="
bg-slate-900
border
border-slate-800
rounded-2xl
p-5
hover:border-blue-500
transition
"
>
<div className="text-3xl">
🏆
</div>

<div className="mt-3 font-bold">
Resultados
</div>
</a>

<a
href="/admin/raffles/analytics"
className="
bg-gradient-to-br
from-blue-900/40
to-blue-950/40
border
border-blue-700
rounded-2xl
p-5
hover:border-blue-400
transition
"
>
<div className="text-3xl">
📈
</div>

<div className="mt-3 font-bold">
Analytics
</div>
</a>

</div>

      {/* METRICS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-7
          gap-4
        "
      >

        <div
className="
grid
grid-cols-2
md:grid-cols-4
gap-4
"
>

<Card
title="Sorteos"
value="Manage"
/>

<Card
title="Ventas"
value="Orders"
/>

<Card
title="Pagos"
value="Payments"
/>

<Card
title="Analytics"
value="View"
/>

</div>

      </div>

      {/* SYSTEM */}

<div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-4
  "
>

  <a
    href="/admin/raffles/system"
    className="
  bg-gradient-to-br
  from-slate-900
  to-slate-950
  border
  border-slate-800
  rounded-3xl
  p-6
  hover:border-blue-500
  transition
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
    text-slate-400
    uppercase
    tracking-wider
  "
>
          System Health
        </p>

        <h3
  className="
    text-xl
    font-bold
    mt-2
    text-white
  "
>
          🛡️ Monitor
        </h3>

      </div>

      <div
        className="
  text-sm
  font-medium
  text-blue-400
"
      >
        View →
      </div>

    </div>

</a>

</div>

    </div>
  )
}

function Card({

  title,
  value

}: any) {

  return (

    <div
      className="
        bg-gradient-to-br
        from-slate-900
        to-slate-950
        border
        border-slate-800
        rounded-3xl
        p-5
      "
    >

      <p
        className="
          text-slate-400
          text-sm
        "
      >
        {title}
      </p>

      <h3
        className="
          text-3xl
          font-bold
          mt-3
          text-white
        "
      >
        {value}
      </h3>

    </div>

  )
}
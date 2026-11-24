"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type PayoutRequest = {
  id: string
  affiliate?: { code?: string; owner_email?: string } | null
  amount_clp: number | string
  status: string
  created_at: string | null
}

const payoutsUrl = "/api/admin/raffles/affiliate-payouts"

class PayoutAccessError extends Error {}

async function fetchPayouts(url: string, method: "GET" | "POST") {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.access_token) {
    throw new PayoutAccessError("Inicia sesión para gestionar los retiros.")
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${session.access_token}` }
  })

  if (res.status === 401) {
    throw new PayoutAccessError("Tu sesión no es válida. Vuelve a iniciar sesión.")
  }

  if (res.status === 403) {
    throw new PayoutAccessError("No tienes permiso para gestionar los retiros.")
  }

  if (!res.ok) {
    throw new Error("No se pudo completar la operación. Inténtalo de nuevo.")
  }

  return res
}

export default function AffiliatePayoutsPage(){
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [error, setError] = useState<{
    kind: "load" | "refresh" | "action" | "uncertain"
    message: string
  } | null>(null)
  const busy = useRef(false)
  const refreshReason = error?.kind === "refresh" || error?.kind === "uncertain" ? error.kind : undefined

  useEffect(() => {
    void updatePayouts()
  }, [])

  async function updatePayouts(
    operation?: { id: string; action: "approve" | "reject" },
    previousResult?: "refresh" | "uncertain"
  ) {
    if (busy.current) return
    busy.current = true

    try {
      if (operation) {
        try {
          const res = await fetchPayouts(`${payoutsUrl}/${operation.id}/${operation.action}`, "POST")
          const result = await res.json()
          if (res.redirected || res.status !== 200 || result?.success !== true) {
            throw new Error("La respuesta no confirmó la operación.")
          }
        } catch (error) {
          if (error instanceof PayoutAccessError) {
            setError({ kind: "action", message: error.message })
          } else {
            setError({
              kind: "uncertain",
              message: "No se pudo confirmar el resultado del retiro. Actualiza el listado antes de volver a actuar."
            })
          }
          return
        }
      }

      try {
        const res = await fetchPayouts(payoutsUrl, "GET")
        const json: { requests?: PayoutRequest[] } = await res.json()
        if (res.redirected || res.status !== 200 || !Array.isArray(json?.requests) ||
            json.requests.some(request => typeof request?.id !== "string" || typeof request.status !== "string")) {
          throw new Error("La respuesta del listado no es válida.")
        }
        setRequests(json.requests)
        setError(null)
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Error desconocido."
        const kind = operation ? "refresh" : previousResult || "load"
        const message = {
          refresh: "El retiro se procesó, pero no se pudo actualizar el listado.",
          uncertain: "El resultado del retiro sigue sin confirmarse y no se pudo actualizar el listado.",
          load: "No se pudo cargar el listado de retiros."
        }[kind]
        setError({ kind, message: `${message} ${detail}` })
      }
    } finally {
      busy.current = false
      setLoading(false)
    }
  }

  function startUpdate(operation?: { id: string; action: "approve" | "reject" }) {
    if (busy.current || (operation && refreshReason)) return
    setLoading(true)
    void updatePayouts(operation, refreshReason)
  }

return(

<div className="space-y-6">

<div>

<h1 className="text-3xl font-bold">

💰 Retiros Influencers

</h1>

<p className="text-[#002314] mt-2">

Solicitudes de pago pendientes e históricas

</p>

</div>

{error && (
  <div>
    <p role="alert" className="text-sm text-red-800">{error.message}</p>
    {error.kind !== "action" && (
      <button
        type="button"
        className="text-sm underline disabled:opacity-50"
        disabled={loading}
        onClick={() => startUpdate()}
      >
        Reintentar cargar el listado
      </button>
    )}
  </div>
)}

<div
className="
bg-[#EDE8FD]
border
border-[#002314]/20
rounded-3xl
overflow-hidden
"
>

<table className="w-full">

<thead
className="bg-[#FAF9F5]"
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
!error &&

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

requests.map((item)=>(

<tr
key={item.id}
className="
border-b
border-[#002314]/20
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
loading || Boolean(refreshReason) || item.status !== "pending"
}

onClick={() => startUpdate({ id: item.id, action: "approve" })}

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
loading || Boolean(refreshReason) || item.status !== "pending"
}

onClick={() => startUpdate({ id: item.id, action: "reject" })}

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

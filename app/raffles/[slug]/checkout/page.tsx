"use client"

import {
  useEffect,
  useState
} from "react"

import {

useParams,
useSearchParams

}

from "next/navigation"

type RaffleData = {
  id: string
  slug: string
  title: string
  prize_title: string
  cover_image: string
  ticket_price_clp: number
}

export default function CheckoutPage() {

  const params = useParams()

  const searchParams =
useSearchParams()

  const [raffle, setRaffle] =
    useState<RaffleData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [quantity, setQuantity] =
    useState(1)

  const [buyerName, setBuyerName] =
    useState("")

  const [buyerEmail, setBuyerEmail] =
    useState("")

  const [buyerPhone, setBuyerPhone] =
    useState("")

    const [buyerRut, setBuyerRut] =
useState("")

const [commercialCode, setCommercialCode] =
useState("")

    const [processing, setProcessing] =
  useState(false)

    const [acceptTerms, setAcceptTerms] =
  useState(false)

const [marketingConsent, setMarketingConsent] =
  useState(false)

  const [quote, setQuote] =
  useState<any>(null)

const [loadingQuote, setLoadingQuote] =
  useState(false)

  const [packQuotes, setPackQuotes] =
useState<any[]>([])

useEffect(() => {

  if (!raffle?.id) {

    return

  }

loadQuote()

loadPackQuotes()

}, [

  raffle?.id,

  quantity,

  commercialCode

])

async function loadQuote() {

  if (!raffle?.id) {

    return

  }

  try {

  setLoadingQuote(true)

  console.log("LOAD QUOTE", {

    commercialCode,

    search:
      window.location.search,

    localStorage:
      localStorage.getItem(
        "raffle_commercial"
      ),

    sessionStorage:
      sessionStorage.getItem(
        "raffle_commercial"
      )

  })

  const res =
  await fetch(

    "/api/raffles/quote",

    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify({

        raffle_id:
          raffle.id,

        quantity,

        commercialCode

      })

    }

  )

    if (!res.ok) {

      setQuote(null)

      return

    }

    const json =
      await res.json()

    setQuote(json)

  }

  catch (error) {

    console.error(error)

    setQuote(null)

  }

  finally {

    setLoadingQuote(false)

  }

}

async function loadPackQuotes() {

  if (!raffle?.id) {

    return

  }

  try {

    const res =
      await fetch(

        "/api/raffles/quote/options",

        {

          method:"POST",

          headers:{

            "Content-Type":"application/json"

          },

          body:JSON.stringify({

            raffle_id:
              raffle.id,

            commercialCode

          })

        }

      )

    if (!res.ok) {

      setPackQuotes([])

      return

    }

    const json =
      await res.json()

      console.log("PACK QUOTES", json)

    setPackQuotes(
      json.packs ?? []
    )

  }

  catch(error){

    console.error(error)

    setPackQuotes([])

  }

}
  
  useEffect(() => {

    console.log(
  "URL SEARCH",
  window.location.search
)

console.log(
  "URL CODE",
  searchParams.get("code")
)

console.log(
  "URL AFF",
  searchParams.get("aff")
)

  loadRaffle()

const qty =
Number(
searchParams.get(
"qty"
)
)

if (

  qty &&
  [1, 3, 5].includes(qty)

) {

setQuantity(qty)

}

const commercial =

searchParams.get("code")

??

searchParams.get("coupon")

??

searchParams.get("aff")

??

searchParams.get("ref")

if (commercial) {

  localStorage.setItem(
    "raffle_commercial",
    commercial.toUpperCase()
  )

  sessionStorage.setItem(
    "raffle_commercial",
    commercial.toUpperCase()
  )

  setCommercialCode(
    commercial.toUpperCase()
  )

}

else {

  const saved =

    localStorage.getItem(
      "raffle_commercial"
    )

    ||

    sessionStorage.getItem(
      "raffle_commercial"
    )

  if (saved) {

    setCommercialCode(saved)

  }

}

  const savedName =
    localStorage.getItem(
      "raffle_buyer_name"
    )

  const savedEmail =
    localStorage.getItem(
      "raffle_buyer_email"
    )

  const savedPhone =
    localStorage.getItem(
      "raffle_buyer_phone"
    )

    const savedRut =
localStorage.getItem(
"raffle_buyer_rut"
)

  const savedQuantity =
    localStorage.getItem(
      "raffle_quantity"
    )

  if (savedName) {
    setBuyerName(savedName)
  }

  if (savedEmail) {
    setBuyerEmail(savedEmail)
  }

  if (savedPhone) {
    setBuyerPhone(savedPhone)
  }

  if(savedRut){
setBuyerRut(savedRut)
}

  if (

!qty &&

savedQuantity &&

!isNaN(Number(savedQuantity))

){

setQuantity(
Number(savedQuantity)
)

}

}, [searchParams])

useEffect(() => {

  localStorage.setItem(
    "raffle_buyer_name",
    buyerName
  )

}, [buyerName])

useEffect(() => {

  localStorage.setItem(
    "raffle_buyer_email",
    buyerEmail
  )

}, [buyerEmail])

useEffect(() => {

  localStorage.setItem(
    "raffle_buyer_phone",
    buyerPhone
  )

}, [buyerPhone])

useEffect(()=>{

localStorage.setItem(
"raffle_buyer_rut",
buyerRut
)

},[buyerRut])

useEffect(() => {

  localStorage.setItem(
    "raffle_quantity",
    String(quantity)
  )

}, [quantity])

  async function loadRaffle() {

    try {

      const res =
        await fetch(
          `/api/raffles/${params.slug}`
        )

      const json =
        await res.json()

      setRaffle(
        json?.raffle || null
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

async function buyTickets() {

    console.log("BOTON PRESIONADO")

  if (!raffle?.id) {
    return
  }

  if (!buyerName.trim()) {

    alert("Ingresa tu nombre")

    return
  }

  if (!buyerEmail.trim()) {

    alert("Ingresa tu correo")

    return
  }

    if(!buyerRut.trim()){

    alert(
    "Ingresa tu RUT"
    )

    return

    }

  if (!buyerPhone.trim()) {

    alert(
      "Ingresa tu teléfono"
    )

    return
  }

  if (!acceptTerms) {

  alert(
"Debes aceptar las Bases Legales y los Términos y Condiciones para continuar."
)

  return
}

try {

  setProcessing(true)
  
console.log(
  "BUY TICKETS",
  {
    commercialCode,
    buyerEmail,
    quantity
  }
)

  const res =
    await fetch(
      "/api/raffles/create-payment",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

  raffle_id:
    raffle.id,

  quantity,

  buyer_name:
    buyerName,

  buyer_email:
    buyerEmail,

  buyer_rut:
    buyerRut,

  buyer_phone:
    buyerPhone,

  source:
"web",

commercialCode

})
      }
    )

  const json =
  await res.json()

console.log(
  "CHECKOUT RESPONSE",
  json
)

if (json?.order_id) {

  localStorage.setItem(

    "last_raffle_order_id",

    json.order_id

  )

}

if (json?.url) {

  console.log("FLOW RESPONSE", json)

  window.location.href =
    `${json.url}?token=${json.token}`

  return

}

if (!res.ok) {

  if (
    json?.error ===
    "pending_order_exists"
  ) {

    alert(
      "Ya tienes una compra pendiente asociada a este correo."
    )

    return
  }

  if (
    json?.error ===
    "rate_limit"
  ) {

    alert(
      "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
    )

    return
  }

  alert(
    "No fue posible iniciar el pago."
  )

  return
}

} catch (error) {

  console.error(error)

} finally {

  setProcessing(false)

}

}

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Cargando checkout...
      </div>
    )

  }

  if (!raffle) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Sorteo no encontrado
      </div>
    )

  }

  return (

    <div className="min-h-screen bg-slate-950 text-white py-12 px-4">

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        <div>

          <img
            src={raffle.cover_image}
            alt={raffle.title}
            className="
              w-full
              rounded-3xl
              border
              border-slate-800
            "
          />

        </div>

        <div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
    max-w-xl
  "
>

          <p className="text-cyan-400 font-semibold mb-2">
            Checkout Seguro
          </p>

          <h1 className="text-3xl lg:text-4xl font-black mb-4">
            {raffle.prize_title}
          </h1>

          <p className="text-slate-300 mb-6">
  Participación oficial del sorteo
</p>

<div
  className="
    grid
    grid-cols-1
    sm:grid-cols-3
    gap-2
    mb-6
  "
>

  <div
    className="
      bg-slate-950
      border
      border-slate-800
      rounded-xl
      py-2
      px-2
      text-center
      text-[13px]
      leading-5
      text-slate-300
    "
  >
    🔒 Pago seguro mediante Flow

  </div>

  <div
    className="
      bg-slate-950
      border
      border-slate-800
      rounded-xl
      py-2
      px-2
      text-center
      text-[13px]
      leading-5
      text-slate-300
    "
  >
    🎟️ Participaciones asignadas automáticamente
  </div>

  <div
    className="
      bg-slate-950
      border
      border-slate-800
      rounded-xl
      py-2
      px-2
      text-center
      text-[13px]
      leading-5
      text-slate-300
    "
  >
    🏆 Sorteo verificable
  </div>

</div>
          
            <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-3
    gap-2
  "
>

              {[1, 3, 5].map((value) => {

                const active =
                  quantity === value

                return (

                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setQuantity(value)
                    }
                   className={`
                      py-3
                      px-2
                      rounded-xl
                      border
                      font-bold

                      ${
                        active
? "bg-cyan-500 border-cyan-400 text-slate-950"
                          : "bg-slate-900 border-slate-700 text-slate-300"
                      }
                    `}
                  >

                    <>

                  {(() => {

                  const pack =

                  packQuotes.find(

                  (p:any)=>

                  p.requestedQuantity === value

                  )

                  const subtotal =
                  Number(
                  pack?.subtotal ??
                  Number(
                  raffle.ticket_price_clp
                  ) * value
                  )

                  const discount =
                  Number(
                  pack?.discount ?? 0
                  )

                  const total =
                  Number(
                  pack?.total ?? subtotal
                  )

                  return (

                  <>

                  <div className="text-sm font-bold">

                  {value === 1

                  ? "Básico"

                  : value === 3

                  ? "Popular ⭐"

                  : "Recomendado 🔥"}

                  </div>

                  <div
                  className={`
                  text-xs
                  mt-0.5
                  ${
                  active

                  ? "text-slate-800"

                  : "text-slate-400"
                  }
                  `}
                  >

                  {value} participación{value>1?"es":""}

                  </div>

                  {

                  discount > 0 && (

                  <div
                  className={`
                  text-[11px]
                  line-through
                  mt-1
                  ${
                  active

                  ? "text-slate-700"

                  : "text-slate-500"
                  }
                  `}
                  >

                  $

                  {subtotal.toLocaleString("es-CL")}

                  </div>

                  )

                  }

                  {

                  discount > 0 && (

                  <div
                  className={`
                  text-[11px]
                  font-semibold
                  ${
                  active

                  ? "text-emerald-800"

                  : "text-emerald-400"
                  }
                  `}
                  >

                  💰 Ahorras $

                  {discount.toLocaleString("es-CL")}

                  </div>

                  )

                  }

                  <div
                  className="
                  text-lg
                  font-black
                  mt-0.5
                  "
                  >

                  $

                  {total.toLocaleString("es-CL")}

                  </div>

                  </>

                  )

                  })()}

                  </>

                  </button>

                )

              })}

                        </div>

          <div
            className="
              mt-8
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
              space-y-3
            "
          >

            <h3 className="text-lg font-bold">
              Datos del Participante
            </h3>

            <input
              type="text"
              autoComplete="name"
              placeholder="Nombre completo"
              value={buyerName}
              onChange={(e) =>
                setBuyerName(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

            <input
                type="email"
                autoComplete="email"
                placeholder="Correo electrónico"
              value={buyerEmail}
              onChange={(e) =>
                setBuyerEmail(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

                <input
type="text"
autoComplete="off"
placeholder="RUT"
                value={buyerRut}
                onChange={(e)=>
                setBuyerRut(
                e.target.value
                )
                }
                className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
                "
                />

            <input
type="tel"
autoComplete="tel"
placeholder="Teléfono móvil"
              value={buyerPhone}
              onChange={(e) =>
                setBuyerPhone(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

            <div
className="
w-full
bg-slate-900
border
border-slate-700
rounded-2xl
px-4
py-3
"
>

<div className="text-xs text-slate-400 mb-2">
Código promocional (opcional)
</div>

<input
type="text"
placeholder="Ingresa tu código promocional"
value={commercialCode}
onChange={(e)=>{

const value =
e.target.value
.trim()
.toUpperCase()

setCommercialCode(value)

localStorage.setItem(
"raffle_commercial",
value
)

sessionStorage.setItem(
"raffle_commercial",
value
)

}}
className="
w-full
bg-transparent
outline-none
text-white
"
/>

</div>

            <div
  className="
    pt-4
    border-t
    border-slate-800
    space-y-3
  "
>

<div
className="
bg-slate-950
border
border-slate-800
rounded-2xl
p-4
mb-4
text-left
"
>

<div className="text-slate-400 text-sm">
Resumen de compra
</div>

<div className="flex justify-between mt-4">

<span>
🎟️ Solicitados
</span>

<span>

{quote?.requestedQuantity ?? quantity}

</span>

</div>

<div className="flex justify-between mt-2">

<span>
🎁 Bonus
</span>

<span>

+

{quote?.bonusQuantity ?? 0}

</span>

</div>

<div className="flex justify-between mt-2">

<span>
✅ Total participaciones
</span>

<span>

{quote?.finalQuantity ?? quantity}

</span>

</div>

{
quote?.promotion?.name && (

<div
className="
mt-3
rounded-xl
bg-emerald-500/10
border
border-emerald-500/30
p-3
"
>

<div className="text-emerald-400 text-sm font-semibold">
🎉 Promoción aplicada
</div>

<div className="mt-1 text-white">
{quote.promotion.name}
</div>

</div>

)
}

{
quote?.affiliate?.code && (

<div
className="
mt-3
rounded-xl
bg-cyan-500/10
border
border-cyan-500/30
p-3
"
>

<div className="text-cyan-400 text-sm font-semibold">
⭐ Código aplicado
</div>

<div className="mt-1 text-white">

{quote.affiliate.code}

</div>

</div>

)
}

{
quote?.discount > 0 && (

<div className="flex justify-between mt-2 text-green-400">

<span>
💰 Descuento
</span>

<span>

-$

{Number(
quote.discount
).toLocaleString("es-CL")}

</span>

</div>

)

}

{

quote?.coupon?.code && (

<div className="flex justify-between mt-2 text-blue-400">

<span>
🏷 Cupón
</span>

<span>

{quote.coupon.code}

</span>

</div>

)

}

<div className="border-t border-slate-800 mt-4 pt-4 flex justify-between font-black text-2xl">

<span>

Total

</span>

<span className="text-cyan-400">

$

{Number(

quote?.total ??

Number(
raffle.ticket_price_clp
) *
quantity

).toLocaleString("es-CL")}

</span>

</div>

</div>

  <label
    className="
      flex
      gap-3
      items-start
      text-sm
      text-slate-300
    "
  >

    <input
      type="checkbox"
      checked={acceptTerms}
      onChange={(e) =>
        setAcceptTerms(
          e.target.checked
        )
      }
    />

    <span>
      He leído y acepto las Bases Legales y los Términos y Condiciones del sorteo.
    </span>

  </label>

  <label
    className="
      flex
      gap-3
      items-start
      text-sm
      text-slate-400
    "
  >

    <input
      type="checkbox"
      checked={marketingConsent}
      onChange={(e) =>
        setMarketingConsent(
          e.target.checked
        )
      }
    />

    <span>
      Deseo recibir novedades
      y futuros sorteos.
    </span>

  </label>

<button
  type="button"
  onClick={buyTickets}
  disabled={

processing ||

!buyerName.trim() ||

!buyerEmail.trim() ||

!buyerRut.trim() ||

!buyerPhone.trim() ||

!acceptTerms

}
  className="
  w-full
  mt-4
  py-4
  rounded-2xl
  bg-cyan-500
hover:bg-cyan-400
text-slate-950
  transition
  font-black
  text-lg
  disabled:opacity-60
  disabled:cursor-not-allowed
  disabled:bg-slate-700
  disabled:text-slate-400
"
>

  {
  processing
    ? "Conectando con Flow..."
    : "Continuar al pago"
}

</button>

</div>

          </div>

        </div>

      </div>

    </div>

  )

}
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

const [affiliateCode, setAffiliateCode] =
useState("")

const [couponCode, setCouponCode] =
useState("")

    const [processing, setProcessing] =
  useState(false)

    const [acceptTerms, setAcceptTerms] =
  useState(false)

const [marketingConsent, setMarketingConsent] =
  useState(false)

  useEffect(() => {

  loadRaffle()

const qty =
Number(
searchParams.get(
"qty"
)
)

if(

qty &&
[1,3,5,10].includes(qty)

){

setQuantity(qty)

}

const aff =
searchParams.get("aff")

if (aff) {

  localStorage.setItem(
    "raffle_affiliate",
    aff
  )

  sessionStorage.setItem(
    "raffle_affiliate",
    aff
  )

  setAffiliateCode(aff)

}
else {

  const saved =

    localStorage.getItem(
      "raffle_affiliate"
    )

    ||

    sessionStorage.getItem(
      "raffle_affiliate"
    )

  if (saved) {

    setAffiliateCode(saved)

  }

}

const coupon =
searchParams.get("coupon")

if (coupon) {

  localStorage.setItem(
    "raffle_coupon",
    coupon
  )

  sessionStorage.setItem(
    "raffle_coupon",
    coupon
  )

  setCouponCode(coupon)

}
else {

  const savedCoupon =

    localStorage.getItem(
      "raffle_coupon"
    )

    ||

    sessionStorage.getItem(
      "raffle_coupon"
    )

  if (savedCoupon) {

    setCouponCode(
      savedCoupon
    )

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

}, [])

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

  const affiliateCode =

  localStorage.getItem(
    "raffle_affiliate"
  )

  ||

  sessionStorage.getItem(
    "raffle_affiliate"
  )

  ||

  undefined

const referralCode =

  localStorage.getItem(
    "raffle_referral"
  )

  ||

  sessionStorage.getItem(
    "raffle_referral"
  )

  ||

  undefined

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

  affiliateCode,

  referralCode

})
      }
    )

  const json =
  await res.json()

console.log(
  "CHECKOUT RESPONSE",
  json
)

if (json?.url) {

  localStorage.setItem(
    "last_raffle_order_id",
    json.order_id
  )

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

          <p className="text-blue-400 font-semibold mb-2">
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
      py-3
      px-3
      text-center
      text-sm
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
      py-3
      px-3
      text-center
      text-sm
      text-slate-300
    "
  >
    🎟️ Tickets asignados automáticamente
  </div>

  <div
    className="
      bg-slate-950
      border
      border-slate-800
      rounded-xl
      py-3
      px-3
      text-center
      text-sm
      text-slate-300
    "
  >
    🏆 Sorteo verificable
  </div>

</div>

          <div
            className="
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
            "
          >

            <div className="text-slate-400 text-sm">
              Valor Ticket
            </div>

            <div className="text-3xl font-black mt-2 mb-6">
              $
              {Number(
                raffle.ticket_price_clp
              ).toLocaleString("es-CL")}
            </div>

            <div className="grid grid-cols-2 gap-2">

              {[1, 3, 5, 10].map((value) => {

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
                      rounded-2xl
                      border
                      font-bold

                      ${
                        active
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-300"
                      }
                    `}
                  >

  <>
  <div className="text-sm">

    {
      value === 1
        ? "Básico"

        : value === 3
        ? "Popular ⭐"

        : value === 5
        ? "Recomendado 🔥"

        : "Premium 👑"
    }

  </div>

  <div className="text-xs opacity-70 mt-1">

    {value} ticket{value > 1 ? "s" : ""}

  </div>

</>

</button>

                )

              })}

            </div>

            <div
              className="
                mt-6
                border
                border-slate-800
                rounded-2xl
                p-4
              "
            >

<div className="flex justify-between text-slate-400 mb-2">

  <span>
    Premio
  </span>

  <span
    className="
      max-w-[180px]
      text-right
      truncate
    "
  >
    {raffle.prize_title}
  </span>

</div>

<div className="flex justify-between text-slate-400 mb-2">

  <span>
    Valor ticket
  </span>

  <span>

    $
    {Number(
      raffle.ticket_price_clp
    ).toLocaleString("es-CL")}

  </span>

</div>

              <div className="flex justify-between text-slate-400">

                <span>
                  Cantidad
                </span>

                <span>
                  {quantity}
                </span>

              </div>

              <div className="flex justify-between text-2xl font-black mt-3">

                <span>
                  Total
                </span>

                <span>

                  $
                  {(
                    Number(
                      raffle.ticket_price_clp
                    ) * quantity
                  ).toLocaleString("es-CL")}

                </span>

              </div>

            </div>

          </div>

<div
  className="
    mt-6
    bg-slate-950
    border
    border-slate-800
    rounded-2xl
    p-4
    space-y-3
  "
>

  <div>
    🔒 Pago seguro mediante Flow
  </div>

  <div>
    🎟️ Tickets asignados automáticamente
  </div>

  <div>
    📧 Confirmación enviada por correo
  </div>

  <div>
    🏆 Sorteo verificable y ganador público
  </div>

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
text-center
"
>

<div className="text-slate-400 text-sm">
Estás comprando
</div>

<div className="text-xl font-black mt-2">
🔥 {quantity} participación{quantity > 1 ? "es" : ""}
</div>

<div className="text-slate-400 mt-3">
Total a pagar
</div>

<div className="text-3xl font-black text-blue-400">

$

{(
Number(
raffle.ticket_price_clp
)
*
quantity
).toLocaleString("es-CL")}

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
  bg-blue-600
  hover:bg-blue-500
  transition
  font-black
  text-lg
  disabled:opacity-60
  disabled:cursor-not-allowed
  disabled:bg-slate-700
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
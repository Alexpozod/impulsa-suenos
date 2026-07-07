"use client"

import { useMemo, useState } from "react"

export default function PaymentSimulatorPage() {

  const [grossSale, setGrossSale] =
    useState("1190000")

  const [commissionPercent, setCommissionPercent] =
    useState("10")

  const [documentType, setDocumentType] =
    useState<"invoice" | "honorarium">("invoice")

  const result = useMemo(() => {

    const gross =
      Number(grossSale || 0)

    const commission =
      Number(commissionPercent || 0)

    const netSale =
      gross / 1.19

    const flowBase =
      gross * 0.0319

    const flowVat =
      flowBase * 0.19

    const flowTotal =
      flowBase + flowVat

    const commissionBase =
      netSale - flowTotal

    const affiliateCommission =
      commissionBase * (commission / 100)

    const withholding =
      affiliateCommission * 0.1525

    const liquid =
      affiliateCommission - withholding

    return {

      gross,

      netSale,

      flowBase,

      flowVat,

      flowTotal,

      commissionBase,

      affiliateCommission,

      withholding,

      liquid

    }

  }, [
    grossSale,
    commissionPercent
  ])

  const money = (v:number)=>

    new Intl.NumberFormat(
      "es-CL",
      {
        style:"currency",
        currency:"CLP",
        maximumFractionDigits:0
      }
    ).format(v)

  return (

<div
className="
max-w-7xl
mx-auto
space-y-6
"
>

<div>

<h1 className="text-3xl lg:text-4xl font-bold">

Simulador de Pago

</h1>

<p className="text-slate-500 mt-2">

Calcula cuánto recibirás como afiliado.

</p>

</div>

<div
className="
grid
grid-cols-1
xl:grid-cols-12
gap-6
items-start
"
>

<div className="
xl:col-span-4
rounded-3xl
bg-white
shadow-lg
p-6
lg:p-7
space-y-5
">

<div>

<label className="block mb-2 font-medium">

Venta Bruta

</label>

<input

type="number"

value={grossSale}

onChange={e=>setGrossSale(e.target.value)}

className="
w-full
h-11
rounded-xl
border
px-4
text-base
font-semibold
text-right
"

/>

</div>

<div>

<label className="block mb-2 font-medium">

Comisión %

</label>

<input

type="number"

value={commissionPercent}

onChange={e=>setCommissionPercent(e.target.value)}

className="
w-full
h-12
rounded-xl
border
px-4
text-base
font-semibold
text-right
"

/>

</div>

<div>

<label className="block mb-3 font-medium">

Documento Tributario

</label>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">
<label className="flex items-center gap-3">

<input

type="radio"

checked={documentType==="invoice"}

onChange={()=>setDocumentType("invoice")}

/>

Factura

</label>

<label className="flex items-center gap-3">

<input

type="radio"

checked={documentType==="honorarium"}

onChange={()=>setDocumentType("honorarium")}

/>

Boleta Honorarios

</label>

</div>

</div>

</div>

<div
className="
xl:col-span-8
rounded-3xl
bg-slate-900
text-white
p-6
lg:p-7
">

<div
className="
mb-3
rounded-2xl
bg-cyan-500/10
border
border-cyan-400/20
shadow-lg
backdrop-blur-sm
p-5
"
>

<div className="text-sm text-cyan-300 uppercase font-semibold">

Resultado Estimado

</div>

<div className="mt-2 text-3xl lg:text-4xl font-bold text-white">

{

documentType==="invoice"

? money(result.affiliateCommission)

: money(result.liquid)

}

</div>

<div className="text-sm text-slate-300 mt-1">

{

documentType==="invoice"

? "Pago que realizará la empresa"

: "Pago líquido luego de la retención"

}

</div>

</div>

<div className="space-y-3 text-base">

<div
className="
rounded-xl
bg-white/5
p-4
mb-4
"
>

<div className="text-cyan-300 text-xs tracking-wider uppercase font-semibold mb-3">

Venta

</div>

<div className="
flex
flex-col
gap-3
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Venta Bruta</span>

<strong>{money(result.gross)}</strong>

</div>

<div className="flex justify-between">

<span>IVA Venta</span>

<strong>

{money(result.gross - result.netSale)}

</strong>

</div>

<div className="flex justify-between font-semibold">

<span>Venta Neta</span>

<strong>{money(result.netSale)}</strong>

</div>

</div>

</div>

<div className="border-t border-white/20 pt-3 mb-3">

<div className="text-cyan-300 text-xs tracking-wider uppercase font-semibold mb-3">

Pasarela de Pago

</div>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Comisión (3,19%)</span>

<strong>{money(result.flowBase)}</strong>

</div>

<div className="flex justify-between">

<span>IVA Comisión</span>

<strong>{money(result.flowVat)}</strong>

</div>

<div className="flex justify-between font-semibold">

<span>Total Comisión Pasarela</span>

<strong>{money(result.flowTotal)}</strong>

</div>

</div>

</div>

<div className="border-t border-white/20 pt-3 mb-3">

<div className="text-cyan-300 text-xs tracking-wider uppercase font-semibold mb-3">

Base Comisión

</div>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Venta Neta</span>

<strong>{money(result.netSale)}</strong>

</div>

<div className="flex justify-between">

<span>(-) Comisión Pasarela</span>

<strong>{money(result.flowTotal)}</strong>

</div>

<div className="flex justify-between font-semibold">

<span>Base Comisión</span>

<strong>{money(result.commissionBase)}</strong>

</div>

</div>

</div>

<div className="border-t border-white/20 pt-3">

<div className="text-cyan-300 text-xs tracking-wider uppercase font-semibold mb-3">

Comisión Afiliado

</div>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Comisión Aplicada</span>

<strong className="text-right whitespace-nowrap">

{commissionPercent}%

</strong>

</div>

<div className="flex justify-between text-xl lg:text-2xl">

<span>Monto Comisión</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission)}

</strong>

</div>

</div>

</div>

{

documentType==="invoice"

?

<div className="border-t border-white/20 pt-3 mt-3">

<div className="text-emerald-300 text-xs tracking-wider uppercase font-semibold mb-3">

Factura Electrónica

</div>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Monto Bruto Factura</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission)}

</strong>

</div>

<div className="flex justify-between">

<span>IVA Factura (19%)</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission * 0.19)}

</strong>

</div>

<div className="flex justify-between">

<span>Total Documento</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission * 1.19)}

</strong>

</div>

<div className="border-t border-white/10 pt-3"/>

<div className="flex justify-between text-green-400 font-semibold text-xl">

<span>Pago Empresa</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission)}

</strong>

</div>

</div>

<div className="mt-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm leading-6 text-emerald-100">

El pago de la empresa corresponde al <strong>monto bruto de la factura</strong>.

El IVA forma parte del documento tributario emitido por el afiliado y deberá ser declarado conforme a la normativa tributaria vigente.

</div>

</div>

:

<>

<div className="border-t border-white/20 pt-3 mt-3">

<div className="text-amber-300 text-xs tracking-wider uppercase font-semibold mb-3">

Boleta de Honorarios

</div>

<div className="
grid
grid-cols-1
sm:grid-cols-2
gap-x-6
gap-y-2
text-sm
">

<div className="flex justify-between">

<span>Monto Bruto Boleta</span>

<strong className="text-right whitespace-nowrap">

{money(result.affiliateCommission)}

</strong>

</div>

<div className="flex justify-between">

<span>Retención 2026 (15,25%)</span>

<strong className="text-right whitespace-nowrap">

{money(result.withholding)}

</strong>

</div>

<div className="border-t border-white/10 pt-3"/>

<div className="flex justify-between text-green-400 font-semibold text-xl">

<span>Pago Líquido</span>

<strong className="text-right whitespace-nowrap">

{money(result.liquid)}

</strong>

</div>

</div>

<div className="mt-5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm leading-6 text-amber-100">

<strong>Importante</strong>

<br/><br/>

La retención corresponde a un anticipo del Impuesto a la Renta establecido por la legislación chilena.

<br/><br/>

Este monto no es retenido por ImpulsaSueños para sí. La empresa lo declara y lo paga al Servicio de Impuestos Internos (SII) a nombre del prestador del servicio.

<br/><br/>

Dependiendo de la situación tributaria del contribuyente, esta retención podrá utilizarse como crédito en la Declaración Anual de Impuesto a la Renta del año siguiente.

</div>

</div>

</>

}

<div className="border-t border-white/20 pt-3 mt-3">

<div className="rounded-xl bg-white/5 p-5">

<div className="text-cyan-300 font-semibold mb-3">

Simulación Referencial

</div>

<div className="space-y-2 text-sm text-slate-300">

<div className="flex justify-between">

<span>IVA Venta</span>

<strong>19%</strong>

</div>

<div className="flex justify-between">

<span>Comisión Pasarela</span>

<strong>3,19%</strong>

</div>

<div className="flex justify-between">

<span>IVA Comisión Pasarela</span>

<strong>19%</strong>

</div>

<div className="flex justify-between">

<span>Retención Boleta 2026</span>

<strong>15,25%</strong>

</div>

</div>

<p className="mt-5 text-xs leading-6 text-slate-400">

Esta simulación es únicamente referencial y tiene como objetivo ayudar al afiliado a estimar el monto de su comisión. Los valores pueden presentar pequeñas diferencias por redondeos, cambios tributarios futuros o condiciones comerciales vigentes al momento del pago.

</p>

</div>

</div>

</div>

</div>

</div>

</div>

  )

}
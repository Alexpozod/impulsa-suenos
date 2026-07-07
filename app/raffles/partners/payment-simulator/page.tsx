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

<div className="space-y-8">

<div>

<h1 className="text-4xl font-bold">

Simulador de Pago

</h1>

<p className="text-slate-500 mt-2">

Calcula cuánto recibirás como afiliado.

</p>

</div>

<div className="grid grid-cols-2 gap-8">

<div className="rounded-3xl bg-white shadow-lg p-8 space-y-6">

<div>

<label className="block mb-2 font-medium">

Venta Bruta

</label>

<input

type="number"

value={grossSale}

onChange={e=>setGrossSale(e.target.value)}

className="w-full rounded-xl border p-3 text-lg"

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

className="w-full rounded-xl border p-3 text-lg"

/>

</div>

<div>

<label className="block mb-3 font-medium">

Documento Tributario

</label>

<div className="space-y-3">

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

<div className="rounded-3xl bg-slate-900 text-white p-8">

<h2 className="text-2xl font-bold mb-6">

Resultado

</h2>

<div className="space-y-4 text-lg">

<div className="mb-6">

<div className="text-cyan-300 text-sm font-semibold uppercase mb-3">

Venta

</div>

<div className="space-y-3">

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

<div className="border-t border-white/20 pt-6 mb-6">

<div className="text-cyan-300 text-sm font-semibold uppercase mb-3">

Pasarela de Pago

</div>

<div className="space-y-3">

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

<div className="border-t border-white/20 pt-6 mb-6">

<div className="text-cyan-300 text-sm font-semibold uppercase mb-3">

Base Comisión

</div>

<div className="space-y-3">

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

<div className="border-t border-white/20 pt-4"/>

<div className="border-t border-white/20 pt-6">

<div className="text-cyan-300 text-sm font-semibold uppercase mb-3">

Comisión Afiliado

</div>

<div className="space-y-3">

<div className="flex justify-between">

<span>Comisión Aplicada</span>

<strong>

{commissionPercent}%

</strong>

</div>

<div className="flex justify-between text-2xl">

<span>Monto Comisión</span>

<strong>

{money(result.affiliateCommission)}

</strong>

</div>

</div>

</div>

{

documentType==="invoice"

?

<div className="border-t border-white/20 pt-6 mt-6">

<div className="text-emerald-300 text-sm font-semibold uppercase mb-3">

Factura Electrónica

</div>

<div className="space-y-3">

<div className="flex justify-between">

<span>Monto Bruto Factura</span>

<strong>

{money(result.affiliateCommission)}

</strong>

</div>

<div className="flex justify-between">

<span>IVA Factura (19%)</span>

<strong>

{money(result.affiliateCommission * 0.19)}

</strong>

</div>

<div className="flex justify-between">

<span>Total Documento</span>

<strong>

{money(result.affiliateCommission * 1.19)}

</strong>

</div>

<div className="border-t border-white/10 pt-3"/>

<div className="flex justify-between text-green-400 font-semibold text-xl">

<span>Pago Empresa</span>

<strong>

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

<div className="border-t border-white/20 pt-6 mt-6">

<div className="text-amber-300 text-sm font-semibold uppercase mb-3">

Boleta de Honorarios

</div>

<div className="space-y-3">

<div className="flex justify-between">

<span>Monto Bruto Boleta</span>

<strong>

{money(result.affiliateCommission)}

</strong>

</div>

<div className="flex justify-between">

<span>Retención 2026 (15,25%)</span>

<strong>

{money(result.withholding)}

</strong>

</div>

<div className="border-t border-white/10 pt-3"/>

<div className="flex justify-between text-green-400 font-semibold text-xl">

<span>Pago Líquido</span>

<strong>

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

<div className="border-t border-white/20 pt-6 mt-6">

<div className="rounded-xl bg-white/5 p-5">

<div className="text-cyan-300 font-semibold mb-4">

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
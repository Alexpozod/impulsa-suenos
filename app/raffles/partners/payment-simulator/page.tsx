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

<div className="flex justify-between">

<span>Base Comisión</span>

<strong>{money(result.commissionBase)}</strong>

</div>

<div className="border-t border-white/20 pt-4"/>

<div className="flex justify-between text-2xl">

<span>Comisión Afiliado</span>

<strong>

{money(result.affiliateCommission)}

</strong>

</div>

{

documentType==="invoice"

?

<div className="flex justify-between">

<span>Pago Empresa</span>

<strong>

{money(result.affiliateCommission)}

</strong>

</div>

:

<>

<div className="flex justify-between">

<span>Retención</span>

<strong>

{money(result.withholding)}

</strong>

</div>

<div className="flex justify-between text-green-400">

<span>Pago Líquido</span>

<strong>

{money(result.liquid)}

</strong>

</div>

</>

}

</div>

</div>

</div>

</div>

  )

}
"use client";

import { useMemo, useState } from "react";

export default function PaymentSimulatorPage() {

    const [sales, setSales] =
  useState(1000000);

const [commission, setCommission] =
  useState(10);

const [documentType, setDocumentType] =
  useState<"boleta" | "factura">(
    "boleta"
  );

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

  const formatInput = (value: number) =>
  new Intl.NumberFormat("es-CL").format(value);

  const simulation = useMemo(() => {

  const VAT_RATE = 0.19;

  const FLOW_PERCENT = 0.0319;

  const FLOW_VAT = 1.19;

  // Retención vigente 2026
  const HONORARIOS_RETENTION = 0.1375;

  // Comisión Flow (sobre la venta bruta)

const flowCommission =
  sales *
  FLOW_PERCENT *
  FLOW_VAT;

// IVA contenido en la venta BRUTA

const saleVat =
  sales -
  (sales / 1.19);

// Base comisionable

const commissionBase =
  sales -
  flowCommission -
  saleVat;

// Comisión afiliado

const affiliateCommission =
  commissionBase *
  (commission / 100);

// Pago disponible

const paymentBase =
  affiliateCommission;

  // Factura
// paymentBase corresponde al TOTAL que recibirá el afiliado
// (incluye IVA si emite factura)

const invoiceNet =
  paymentBase / (1 + VAT_RATE);

const invoiceVat =
  paymentBase - invoiceNet;

const invoiceTotal =
  paymentBase;

  // Boleta

  const retention =
    paymentBase *
    HONORARIOS_RETENTION;

  const honorariosNet =
    paymentBase -
    retention;

  return {

  saleVat,

  commissionBase,

  affiliateCommission,

  flowCommission,

  paymentBase,

  invoiceNet,

  invoiceVat,

  invoiceTotal,

  retention,

  honorariosNet,

};

}, [
  sales,
  commission
]);

  return (
    <div className="space-y-6">

      {/* Configuración */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h2 className="text-xl font-bold mb-1">
          Configuración
        </h2>

        <p className="text-gray-500 mb-4">
          Ingresa tus datos para estimar cuánto recibirás.
        </p>

        <div className="grid md:grid-cols-3 gap-4">

          <div>

            <label className="block text-sm font-medium mb-2">
              Ventas Totales
            </label>

            <input
                type="text"
                value={`$${formatInput(sales)}`}
                onChange={(e) => {

                    const onlyNumbers =
                    e.target.value.replace(/\D/g, "");

                    setSales(Number(onlyNumbers) || 0);

                }}
                className="w-full rounded-lg border px-3 py-2"
                />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Comisión (%)
            </label>

            <input
                type="number"
                value={commission}
                onChange={(e) =>
                    setCommission(Number(e.target.value) || 0)
                }
                className="w-full rounded-lg border px-3 py-2"
                />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Documento Tributario
            </label>

            <select
                value={documentType}
                onChange={(e) =>
                    setDocumentType(
                    e.target.value as "boleta" | "factura"
                    )
                }
                className="w-full rounded-lg border px-3 py-2"
                >

                <option value="boleta">
                    Boleta
                </option>

                <option value="factura">
                    Factura
                </option>

                </select>

          </div>

        </div>

      </div>

      {/* Resultado */}

<div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

  <div className="px-5 py-4 border-b">

    <h2 className="text-xl font-bold">
        Simulación del Pago
        </h2>

    <p className="text-gray-500 mt-1">
        La base comisionable se obtiene descontando la comisión de la pasarela de pago y el IVA de la venta. Sobre esa base se calcula tu comisión.
        </p>
  </div>

  <table className="w-full">

    <tbody>

      <tr className="border-b">
        <td className="px-4 py-3 font-medium">
          Venta ingresada
        </td>

        <td className="text-right px-4 py-3 font-semibold">
          {formatMoney(sales)}
        </td>
      </tr>
      
      <tr className="border-b">
            <td className="px-4 py-3">
                Comisión pasarela de pago (3,19% + IVA)
            </td>

            <td className="text-right px-4 py-3 text-red-600">
                -{formatMoney(simulation.flowCommission)}
            </td>
            </tr>

            <tr className="border-b">
            <td className="px-4 py-3">
                IVA incluido
            </td>

            <td className="text-right px-4 py-3 text-red-600">
                -{formatMoney(simulation.saleVat)}
            </td>
            </tr>

            <tr className="border-b bg-slate-50">
            <td className="px-4 py-3 font-semibold">
                Base comisionable
            </td>

            <td className="text-right px-4 py-3 font-semibold">
                {formatMoney(simulation.commissionBase)}
            </td>
            </tr>

      <tr className="border-b">
        <td className="px-4 py-3">
          Comisión afiliado ({commission}%)
        </td>

        <td className="text-right px-4 py-3">
          {formatMoney(simulation.affiliateCommission)}
        </td>
      </tr>
      
      <tr className="bg-cyan-50 border-b">
        <td className="px-4 py-3 font-bold">
          Comisión disponible para pago
        </td>

        <td className="text-right px-4 py-3 font-bold text-cyan-700">
          {formatMoney(simulation.paymentBase)}
        </td>
      </tr>

    </tbody>

  </table>

  {documentType === "factura" ? (

  <div className="p-5">

    <h3 className="font-bold text-xl mb-5">
      Factura
    </h3>

    <div className="space-y-3">

      <div className="flex justify-between">
        <span>Monto neto factura</span>
        <strong>{formatMoney(simulation.invoiceNet)}</strong>
      </div>

      <div className="flex justify-between">
        <span>IVA factura</span>
        <strong>{formatMoney(simulation.invoiceVat)}</strong>
      </div>

      <div className="flex justify-between border-t pt-4 text-lg">
        <span>Total factura</span>
        <strong>{formatMoney(simulation.invoiceTotal)}</strong>
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-5">

        <div className="text-sm text-gray-500">
            Monto bruto de tu factura
            </div>

            <div className="text-3xl font-bold text-emerald-700">
            {formatMoney(simulation.invoiceTotal)}
            </div>

      </div>

    </div>

  </div>

) : (

  <div className="p-5">

    <h3 className="font-bold text-xl mb-5">
      Boleta de Honorarios
    </h3>

    <div className="space-y-3">

      <div className="flex justify-between">
        <span>Monto bruto boleta</span>
        <strong>{formatMoney(simulation.paymentBase)}</strong>
      </div>

      <div className="flex justify-between">
        <span>Retención SII</span>
        <strong className="text-red-600">
          {formatMoney(simulation.retention)}
        </strong>
      </div>

      <div className="flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Monto total</span>
            <strong>{formatMoney(simulation.honorariosNet)}</strong>
            </div>

      <div className="mt-4 rounded-xl bg-cyan-50 border border-cyan-200 p-5">

        <div className="text-sm text-gray-500">
          Recibirás en tu cuenta
        </div>

        <div className="text-3xl font-bold text-cyan-700">
          {formatMoney(simulation.honorariosNet)}
        </div>

      </div>

      <p className="mt-4 text-sm text-slate-600 leading-6">
            La retención realizada por el SII no se pierde. Ese monto quedará registrado
            a tu favor y podrá ser considerado en tu declaración anual de impuestos del
            próximo año, según tu situación tributaria.
            </p>

    </div>

  </div>

)}

</div>

</div>

);
}
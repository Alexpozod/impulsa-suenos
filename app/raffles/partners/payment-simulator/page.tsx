"use client";

export default function PaymentSimulatorPage() {
  return (
    <div className="space-y-6">

      {/* Configuración */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold mb-1">
          Configuración
        </h2>

        <p className="text-gray-500 mb-6">
          Ingresa tus datos para estimar cuánto recibirás.
        </p>

        <div className="grid md:grid-cols-3 gap-5">

          <div>

            <label className="block text-sm font-medium mb-2">
              Ventas Totales
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              placeholder="$1.000.000"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Comisión (%)
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              placeholder="10"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Documento Tributario
            </label>

            <select className="w-full rounded-lg border p-3">

              <option>Boleta</option>

              <option>Factura</option>

            </select>

          </div>

        </div>

      </div>

      {/* Resultado */}

<div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

  <div className="px-6 py-5 border-b">

    <h2 className="text-2xl font-bold">
      Resumen del Pago
    </h2>

    <p className="text-gray-500 mt-1">
      El cálculo se realiza automáticamente considerando IVA,
      comisión de Flow y el tipo de documento tributario.
    </p>

  </div>

  <table className="w-full">

    <tbody>

      <tr className="border-b">
        <td className="p-4 font-medium">
          Venta ingresada
        </td>

        <td className="text-right p-4 font-semibold">
          $1.000.000
        </td>
      </tr>

      <tr className="border-b">
        <td className="p-4">
          IVA incluido en la venta
        </td>

        <td className="text-right p-4 text-red-600">
          -$159.664
        </td>
      </tr>

      <tr className="border-b bg-slate-50">
        <td className="p-4 font-semibold">
          Venta sin IVA
        </td>

        <td className="text-right p-4 font-semibold">
          $840.336
        </td>
      </tr>

      <tr className="border-b">
        <td className="p-4">
          Comisión afiliado (10%)
        </td>

        <td className="text-right p-4">
          $84.034
        </td>
      </tr>

      <tr className="border-b">
        <td className="p-4">
          Comisión Flow (3,19% + IVA)
        </td>

        <td className="text-right p-4 text-red-600">
          -$37.961
        </td>
      </tr>

      <tr className="bg-cyan-50 border-b">
        <td className="p-4 font-bold">
          Base de Pago
        </td>

        <td className="text-right p-4 font-bold text-cyan-700">
          $46.073
        </td>
      </tr>

    </tbody>

  </table>

  <div className="grid md:grid-cols-2">

    <div className="border-r p-6">

      <h3 className="font-bold text-xl mb-5">
        Factura
      </h3>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span>Monto bruto factura</span>
          <strong>$46.073</strong>
        </div>

        <div className="flex justify-between">
          <span>IVA factura</span>
          <strong>$8.754</strong>
        </div>

        <div className="flex justify-between border-t pt-4 text-lg">

          <span>Total factura</span>

          <strong>
            $54.827
          </strong>

        </div>

        <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5">

          <div className="text-sm text-gray-500">
            La empresa pagará
          </div>

          <div className="text-3xl font-bold text-emerald-700">

            $46.073

          </div>

        </div>

      </div>

    </div>

    <div className="p-6">

      <h3 className="font-bold text-xl mb-5">
        Boleta de Honorarios
      </h3>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span>Monto bruto boleta</span>
          <strong>$46.073</strong>
        </div>

        <div className="flex justify-between">
          <span>Retención SII</span>
          <strong className="text-red-600">
            -$6.219
          </strong>
        </div>

        <div className="mt-6 rounded-xl bg-cyan-50 border border-cyan-200 p-5">

          <div className="text-sm text-gray-500">
            Recibirás
          </div>

          <div className="text-3xl font-bold text-cyan-700">

            $39.854

          </div>

        </div>

      </div>

    </div>

  </div>

</div>

    </div>
  );
}
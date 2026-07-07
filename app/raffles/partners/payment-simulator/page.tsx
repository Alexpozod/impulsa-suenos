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
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Comisión (%)
        </label>

        <input
          type="number"
          className="w-full rounded-lg border p-3"
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

    <div className="px-6 py-4 border-b">

      <h2 className="text-xl font-bold">
        Resumen del Pago
      </h2>

    </div>

    <table className="w-full">

      <thead className="bg-gray-50">

        <tr>

          <th className="text-left p-4">
            Concepto
          </th>

          <th className="text-left p-4">
            Cálculo
          </th>

          <th className="text-right p-4">
            Resultado
          </th>

        </tr>

      </thead>

      <tbody>

        <tr className="border-t">

          <td className="p-4">
            Ventas generadas
          </td>

          <td className="p-4 text-gray-500">
            —
          </td>

          <td className="p-4 text-right font-semibold">
            $1.000.000
          </td>

        </tr>

        <tr className="border-t">

          <td className="p-4">
            Comisión (15%)
          </td>

          <td className="p-4 text-gray-500">
            $1.000.000 × 15%
          </td>

          <td className="p-4 text-right font-semibold">
            $150.000
          </td>

        </tr>

        <tr className="border-t">

          <td className="p-4">
            IVA
          </td>

          <td className="p-4 text-gray-500">
            Según documento
          </td>

          <td className="p-4 text-right font-semibold text-red-600">
            -$28.500
          </td>

        </tr>

        <tr className="border-t bg-cyan-50">

          <td className="p-4 font-bold text-lg">
            Total a recibir
          </td>

          <td></td>

          <td className="p-4 text-right text-2xl font-bold text-cyan-600">
            $121.500
          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>
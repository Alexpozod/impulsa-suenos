export default function LedgerTable({ 
  ledger, 
  showCampaignId = false 
}: { 
  ledger: any[],
  showCampaignId?: boolean 
}) {

  const getLabel = (tx: any) => {
    const type = tx.type

    if (type === "donation" || type === "payment") {
      return "Donación recibida"
    }

    if (type === "withdraw") {
      if (tx.status === "pending") return "Retiro pendiente"
      if (tx.status === "rejected") return "Retiro rechazado"
      return "Retiro aprobado"
    }

    if (type === "fee_mp") return "Comisión MercadoPago"
    if (type === "fee_platform") return "Comisión plataforma"

    return type
  }

  const getIcon = (tx: any) => {
    const type = tx.type

    if (type === "donation" || type === "payment") return "💰"
    if (type === "withdraw") {
      if (tx.status === "pending") return "⏳"
      if (tx.status === "rejected") return "❌"
      return "🏦"
    }
    if (type.includes("fee")) return "💸"

    return "•"
  }

  const getColor = (tx: any) => {
    const type = tx.type

    if (type === "donation" || type === "payment") return "text-green-600"
    if (type === "withdraw") return "text-red-600"
    if (type.includes("fee")) return "text-red-500"

    return "text-gray-700"
  }

  const getBg = (tx: any) => {
    const type = tx.type

    if (type === "donation" || type === "payment") return "bg-green-50"
    if (type === "withdraw") return "bg-red-50"

    return "bg-gray-50"
  }

  const getSign = (tx: any) => {
    const type = tx.type

    if (type === "donation" || type === "payment") return "+"
    return "-"
  }

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">

      <h2 className="font-bold mb-4">Movimientos</h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <tbody>

            {ledger?.length === 0 && (
              <tr>
                <td className="text-gray-500 text-sm py-6 text-center">
                  No hay movimientos aún
                </td>
              </tr>
            )}

            {ledger?.map((tx) => (

              <tr 
                key={tx.id} 
                className="border-t hover:bg-gray-50 transition"
              >

                {/* Tipo + campaña */}
                <td className="py-3">

                  <div className="flex items-center gap-3">

                    {/* ICONO */}
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${getBg(tx)}`}>
                      <span className="text-sm">
                        {getIcon(tx)}
                      </span>
                    </div>

                    {/* INFO */}
                    <div className="flex flex-col">

                      <span className="font-medium text-gray-800">
                        {getLabel(tx)}
                      </span>

                      <span className="text-xs text-gray-400">
                        {tx.campaign?.title || "Campaña"}
                      </span>

                      {showCampaignId && (
                        <span className="text-[10px] text-gray-500">
                          {tx.campaign_id}
                        </span>
                      )}

                    </div>

                  </div>

                </td>

                {/* MONTO */}
                <td className={`py-3 text-right font-semibold ${getColor(tx)}`}>

                  {getSign(tx)}
                  ${Math.abs(Number(tx.amount || 0)).toLocaleString()}

                </td>

                {/* FECHA */}
                <td className="py-3 text-xs text-gray-500 text-right">

                  {new Date(tx.created_at).toLocaleDateString()}

                  {/* STATUS (solo retiros) */}
                  {tx.type === "withdraw" && (
                    <div className="text-[10px] mt-1">

                      {tx.status === "pending" && (
                        <span className="text-yellow-600">Pendiente</span>
                      )}

                      {tx.status === "approved" && (
                        <span className="text-green-600">Aprobado</span>
                      )}

                      {tx.status === "rejected" && (
                        <span className="text-red-600">Rechazado</span>
                      )}

                    </div>
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
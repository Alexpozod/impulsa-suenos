export default function LedgerTable({ 
  ledger, 
  showCampaignId = false 
}: { 
  ledger: any[],
  showCampaignId?: boolean 
}) {

  const getLabel = (type: string) => {
    switch (type) {
      case "payment": return "💰 Donación"
      case "withdraw": return "🏦 Retiro"
      case "fee_mp": return "💳 Comisión MP"
      case "fee_platform": return "🧾 Comisión plataforma"
      case "withdraw_pending": return "⏳ Retiro pendiente"
      case "withdraw_rejected": return "❌ Retiro rechazado"
      default: return type
    }
  }

  const getColor = (type: string) => {
    if (type === "payment") return "text-green-600"
    if (type.includes("withdraw") || type.includes("fee")) return "text-red-600"
    return "text-gray-700"
  }

  const getSign = (type: string) => {
    if (type === "payment") return "+"
    return "-"
  }

  return (
    <div className="border rounded-xl p-4">

      <h2 className="font-bold mb-4">Movimientos</h2>

      <table className="w-full text-sm">

        <tbody>

          {ledger?.length === 0 && (
            <tr>
              <td className="text-gray-500 text-sm py-4">
                No hay movimientos aún
              </td>
            </tr>
          )}

          {ledger?.map((tx) => (

            <tr key={tx.id} className="border-t">

              {/* Tipo + Campaña */}
              <td className="py-2">
                <div className="flex flex-col">

                  <span>
                    {getLabel(tx.type)}
                  </span>

                  {/* ✅ nombre campaña */}
                  <span className="text-xs text-gray-400">
                    {tx.campaigns?.title}
                  </span>

                  {/* 🔥 SOLO ADMIN */}
                  {showCampaignId && (
                    <span className="text-[10px] text-gray-500">
                      {tx.campaign_id}
                    </span>
                  )}

                </div>
              </td>

              {/* Monto */}
              <td className={`py-2 text-right font-semibold ${getColor(tx.type)}`}>
                {getSign(tx.type)}
                ${Math.abs(Number(tx.amount || 0)).toLocaleString()}
              </td>

              {/* Fecha */}
              <td className="py-2 text-xs text-gray-500 text-right">
                {new Date(tx.created_at).toLocaleDateString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}
"use client"

export default function FinancialAlerts({ data }: { data: any }) {

  if (!data) return null

  const { totals, campaigns } = data

  const hasBalance = Number(totals?.balance || 0) > 0

  // 🔧 ESTO ES FLEXIBLE SEGÚN TU SISTEMA
  const hasCampaigns = campaigns?.length > 0

  // ⚠️ PLACEHOLDER (luego puedes conectar real)
  const hasBank = true
  const hasKYC = true

  const alerts = []

  if (!hasCampaigns) {
    alerts.push({
      type: "info",
      message: "Crea tu primera campaña para comenzar a recibir donaciones"
    })
  }

  if (!hasBalance) {
    alerts.push({
      type: "warning",
      message: "Aún no tienes saldo disponible para retirar"
    })
  }

  if (!hasBank) {
    alerts.push({
      type: "error",
      message: "Agrega una cuenta bancaria para poder retirar fondos"
    })
  }

  if (!hasKYC) {
    alerts.push({
      type: "error",
      message: "Debes completar tu verificación (KYC) antes de retirar"
    })
  }

  if (alerts.length === 0) return null

  const getStyle = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-400 text-red-700"
      case "warning":
        return "bg-yellow-50 border-yellow-400 text-yellow-700"
      default:
        return "bg-blue-50 border-blue-400 text-blue-700"
    }
  }

  return (
    <div className="space-y-3">

      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`border rounded-xl p-4 text-sm ${getStyle(alert.type)}`}
        >
          {alert.message}
        </div>
      ))}

    </div>
  )
}
export function formatMoney(
  amount: number = 0,
  currency: string = "CLP"
) {

  const numeric = Number(amount || 0)

  // 🇨🇱 PESOS CHILENOS
  if (currency === "CLP") {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numeric)
  }

  // 🇺🇸 DÓLARES
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric)
  }

  // 🌍 FALLBACK
  return numeric.toLocaleString()
}
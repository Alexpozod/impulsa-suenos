export function safeCLPtoUSD(amount: number, rate: number) {
  if (!amount || !rate || rate <= 0) return 0
  return amount / rate
}
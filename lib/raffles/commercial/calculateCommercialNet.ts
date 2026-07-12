export interface CommercialNetInput {

  grossAmount: number

  vatPercent: number

  gatewayPercent: number

}

export interface CommercialNetResult {

  grossAmount: number

  vatPercent: number

  vatAmount: number

  gatewayPercent: number

  gatewayNetFee: number

  gatewayVat: number

  gatewayTotalFee: number

  netCommercialAmount: number

}

export function calculateCommercialNet(

  input: CommercialNetInput

): CommercialNetResult {

  const grossAmount =
    Number(input.grossAmount)

  const vatPercent =
    Number(input.vatPercent)

  const gatewayPercent =
    Number(input.gatewayPercent)

  /*
    IVA incluido.

    Ejemplo:

    10.000

    IVA 19%

    Base = 8.403

    IVA = 1.597
  */

  const taxableBase =
    grossAmount /
    (1 + vatPercent / 100)

  const vatAmount =
    Math.round(
      grossAmount - taxableBase
    )

  const gatewayNetFee =
  Math.round(
    grossAmount *
    gatewayPercent /
    100
  )

const gatewayVat =
  Math.round(
    gatewayNetFee *
    vatPercent /
    100
  )

const gatewayTotalFee =
  gatewayNetFee +
  gatewayVat

  const netCommercialAmount =
  Math.round(
    grossAmount -
    vatAmount -
    gatewayTotalFee
  )

  return {

  grossAmount,

  vatPercent,

  vatAmount,

  gatewayPercent,

  gatewayNetFee,

  gatewayVat,

  gatewayTotalFee,

  netCommercialAmount

}

}
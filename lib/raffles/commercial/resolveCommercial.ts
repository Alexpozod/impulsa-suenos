import {
  CommercialInput,
  CommercialResolution
} from "./types"

export async function resolveCommercial(
  input: CommercialInput
): Promise<CommercialResolution> {

  return {

    found: false,

    type: "none",

    bonusQuantity: 0,

    discountAmount: 0,

    commissionAmount: 0,

    commissionPercent: 0

  }

}
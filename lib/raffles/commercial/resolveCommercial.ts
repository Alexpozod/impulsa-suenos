import {
  CommercialInput,
  CommercialResolution
} from "./types"

import {
  normalizeCommercialCode
} from "./normalizeCommercialCode"

import {
  resolveAffiliate
} from "../affiliate/resolveAffiliate"

import {
  resolveCoupon
} from "../coupon/resolveCoupon"

import {
  resolveReferral
} from "../referral/resolveReferral"

export async function resolveCommercial(
  input: CommercialInput
): Promise<CommercialResolution> {

  const code =
    normalizeCommercialCode(
      input.commercialCode
    )

  if (!code) {

    return {

      found: false,

      type: "none",

      bonusQuantity: 0,

      discountAmount: 0,

      commissionAmount: 0,

      commissionPercent: 0

    }

  }

  /* =========================
     AFFILIATE
  ========================= */

  const affiliate =
    await resolveAffiliate(code)

  if (affiliate?.found) {

    return {

      found: true,

      type: "affiliate",

      id:
        affiliate.affiliateId,

      code:
        affiliate.affiliateCode,

      name:
        affiliate.affiliateName,

            commissionAmount:
        affiliate.commissionAmount ?? 0,

      commissionPercent:
        affiliate.commissionValue ?? 0,

      bonusQuantity: 0,

      discountAmount: 0,

      metadata: affiliate

    }

  }

  /* =========================
     COUPON
  ========================= */

  const coupon =
    await resolveCoupon(
      code,
      input.subtotal
    )

  if (coupon?.found) {

    return {

      found: true,

      type: "coupon",

      id:
        coupon.id,

      code:
        coupon.code,

      bonusQuantity: 0,

      discountAmount:
        coupon.discountAmount ?? 0,

      commissionAmount: 0,

      commissionPercent: 0,

      metadata: coupon

    }

  }

  /* =========================
     REFERRAL
  ========================= */

  const referral =
    await resolveReferral(code)

  if (referral?.found) {

    return {

      found: true,

      type: "referral",

      code:
        referral.referralCode,

      bonusQuantity: 0,

      discountAmount: 0,

      commissionAmount: 0,

      commissionPercent: 0,

      metadata: referral

    }

  }

  return {

    found: false,

    type: "none",

    bonusQuantity: 0,

    discountAmount: 0,

    commissionAmount: 0,

    commissionPercent: 0

  }

}
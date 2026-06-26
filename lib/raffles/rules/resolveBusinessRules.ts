import { COMMERCIAL_PRIORITY } from "./priority"

import { applyPromotions } from "../promotion/applyPromotions"

import { resolveAffiliate } from "../affiliate/resolveAffiliate"

import { resolveReferral } from "../referral/resolveReferral"

import { RuleContext, RuleResult } from "./types"

import { resolveCoupon } from "../coupon/resolveCoupon"

import { resolveCommercial } from "../commercial"

export async function resolveBusinessRules(

  context: RuleContext

): Promise<RuleResult> {

  const promotion =
    await applyPromotions({

      raffleId:
        context.raffleId,

      quantity:
        context.quantity,

      subtotal:
        context.subtotal,

      unitPrice:
        context.unitPrice

    })

    const commercial =
  await resolveCommercial({

    raffleId:
      context.raffleId,

    quantity:
      context.quantity,

    subtotal:
      context.subtotal,

    unitPrice:
      context.unitPrice,

    commercialCode:
      context.commercialCode

  })

  const affiliate =

  commercial.type === "affiliate"

    ? commercial.metadata

    : await resolveAffiliate(
        context.affiliateCode
      )

const referral =

  commercial.type === "referral"

    ? commercial.metadata

    : await resolveReferral(
        context.referralCode
      )

const coupon =

  commercial.type === "coupon"

    ? commercial.metadata

    : await resolveCoupon(
        context.couponCode,
        context.subtotal
      )

  const hasCommercialRule =

    promotion.applied ||

    coupon?.found ||

    affiliate?.found ||

    referral?.found

  let highestPriority = 0

  let winningRule:
    | "promotion"
    | "coupon"
    | "affiliate"
    | "referral"
    | "none"
    =
    "none"

  if (coupon?.found) {

    highestPriority =
      COMMERCIAL_PRIORITY.coupon

    winningRule =
      "coupon"

  }

  else if (promotion.applied) {

    highestPriority =
      COMMERCIAL_PRIORITY.promotion

    winningRule =
      "promotion"

  }

  else if (affiliate?.found) {

    highestPriority =
      COMMERCIAL_PRIORITY.affiliate

    winningRule =
      "affiliate"

  }

  else if (referral?.found) {

    highestPriority =
      COMMERCIAL_PRIORITY.referral

    winningRule =
      "referral"

  }

  let commercialRuleSource:
    | "promotion"
    | "coupon"
    | "bundle"
    | "affiliate"
    | "referral"
    | "none"
    =
    "none"

  switch (winningRule) {

    case "coupon":

      commercialRuleSource =
        "coupon"

      break

    case "promotion":

      commercialRuleSource =
        "promotion"

      break

    case "affiliate":

      commercialRuleSource =
        "affiliate"

      break

    case "referral":

      commercialRuleSource =
        "referral"

      break

  }

  return {

    promotion: {

      applied:
        winningRule === "promotion"
          ? promotion.applied
          : false,

      promotionId:
        winningRule === "promotion"
          ? promotion.promotionId
          : undefined,

      promotionCode:
        winningRule === "promotion"
          ? promotion.promotionCode
          : undefined,

      promotionName:
        winningRule === "promotion"
          ? promotion.promotionName
          : undefined,

      bonusQuantity:
        winningRule === "promotion"
          ? promotion.bonusQuantity
          : 0,

      discount:
        winningRule === "promotion"
          ? promotion.discount
          : 0

    },

    affiliate:

      winningRule === "affiliate"
        ? affiliate
        : null,

    referral:

      winningRule === "referral"
        ? referral
        : null,

    coupon:

      winningRule === "coupon"
        ? coupon
        : null,

    hasCommercialRule,

    commercialRuleSource,

    highestPriority,

    winningRule

  }

}
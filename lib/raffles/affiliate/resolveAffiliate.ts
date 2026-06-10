import { AffiliateResult } from "./types"

export async function resolveAffiliate(

  affiliateCode?: string | null

): Promise<AffiliateResult> {

  /*
    En este Sprint aún no consultamos BD.

    Este archivo será el único punto
    autorizado para resolver influencers.

    Más adelante leerá:

    raffles.affiliate_programs
    raffles.affiliates
    raffles.affiliate_links

    sin modificar calculateQuote().
  */

  if (!affiliateCode) {

    return {

      found: false

    }

  }

  return {

    found: true,

    affiliateCode,

    affiliateName: affiliateCode,

    commissionType: "percentage",

    commissionValue: 0,

    commissionAmount: 0

  }

}
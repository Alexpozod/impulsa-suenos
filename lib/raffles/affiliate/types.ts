export interface AffiliateResult {

  found: boolean

  affiliateId?: string

  affiliateCode?: string

  affiliateName?: string

  commissionType?: "percentage" | "fixed"

  commissionValue?: number

  commissionAmount?: number

  bonusQuantity1?: number

  bonusQuantity3?: number

  bonusQuantity5?: number

}
export interface AffiliateContext {

    code?: string | null

    landingUrl?: string | null

    source?: string | null

}

export interface AffiliateResolution {

    found: boolean

    affiliateId?: string

    affiliateCode?: string

    affiliateName?: string

    commissionType?: "percentage" | "fixed"

    commissionValue?: number

}
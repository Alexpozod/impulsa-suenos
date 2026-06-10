import { normalizeAffiliateCode }
from "./normalizeAffiliateCode"

export function isValidAffiliateCode(

    code?: string | null

): boolean {

    const value =
        normalizeAffiliateCode(
            code
        )

    if (!value) {

        return false

    }

    return /^[A-Z0-9_-]{3,30}$/.test(
        value
    )

}
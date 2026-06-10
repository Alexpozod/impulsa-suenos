export function normalizeAffiliateCode(

    code?: string | null

): string | null {

    if (!code) {

        return null

    }

    const value =
        code
            .trim()
            .toUpperCase()

    if (!value.length) {

        return null

    }

    return value

}
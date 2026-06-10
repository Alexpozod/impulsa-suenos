import { TrackingContext } from "./types"

export function createTrackingContext(

    data: TrackingContext

): TrackingContext {

    return {

        source:
            data.source ?? null,

        referrer:
            data.referrer ?? null,

        affiliateCode:
            data.affiliateCode ?? null,

        referralCode:
            data.referralCode ?? null,

        couponCode:
            data.couponCode ?? null,

        utm_source:
            data.utm_source ?? null,

        utm_medium:
            data.utm_medium ?? null,

        utm_campaign:
            data.utm_campaign ?? null,

        utm_content:
            data.utm_content ?? null,

        utm_term:
            data.utm_term ?? null,

        ip:
            data.ip ?? null,

        userAgent:
            data.userAgent ?? null

    }

}
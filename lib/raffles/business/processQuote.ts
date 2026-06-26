import { calculateQuote } from "../quote/calculateQuote"

import {

    QuoteResult

} from "../quote/types"

import {

    BusinessContext

} from "./types"

export async function processQuote(

    context: BusinessContext

): Promise<QuoteResult> {

    return await calculateQuote({

        raffleId:
            context.raffleId,

        quantity:
            context.quantity,

        userId:
            context.userId,

        commercialCode:
    context.tracking.commercialCode ??

    context.tracking.affiliateCode ??

    context.tracking.couponCode ??

    context.tracking.referralCode,

affiliateCode:
    context.tracking.affiliateCode,

referralCode:
    context.tracking.referralCode,

couponCode:
    context.tracking.couponCode,

        source:
            context.tracking.source,

        referrer:
            context.tracking.referrer,

        utm_source:
            context.tracking.utm_source,

        utm_medium:
            context.tracking.utm_medium,

        utm_campaign:
            context.tracking.utm_campaign,

        utm_content:
            context.tracking.utm_content,

        utm_term:
            context.tracking.utm_term,

        ip:
            context.tracking.ip,

        userAgent:
            context.tracking.userAgent

    })

}
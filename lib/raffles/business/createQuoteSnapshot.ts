import { QuoteResult } from "../quote/types"

export function createQuoteSnapshot(

    quote: QuoteResult

) {

    return {

        raffleId:
            quote.raffleId,

        requestedQuantity:
            quote.requestedQuantity,

        bonusQuantity:
            quote.bonusQuantity,

        finalQuantity:
            quote.finalQuantity,

        unitPrice:
            quote.unitPrice,

        subtotal:
            quote.subtotal,

        discount:
            quote.discount,

        total:
            quote.total,

        currency:
            quote.currency,

        promotion:
            quote.promotion,

        affiliate:
            quote.affiliate,

        referral:
            quote.referral,

        coupon:
            quote.coupon,

        metadata:
            quote.metadata

    }

}
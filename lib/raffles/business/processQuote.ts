import { calculateQuote } from "../quote/calculateQuote"
import { QuoteInput, QuoteResult } from "../quote/types"

export async function processQuote(

    input: QuoteInput

): Promise<QuoteResult> {

    /*
        Este archivo será el único
        punto autorizado para calcular
        una compra.

        En el futuro aquí podrán
        agregarse:

        - Wallet

        - Cashback

        - Membership

        - Loyalty

        - Dynamic Pricing

        sin modificar checkout.
    */

    return await calculateQuote(
        input
    )

}
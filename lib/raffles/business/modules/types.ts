import { QuoteResult } from "../../quote/types"
import { BusinessContext } from "../types"

export interface BusinessModule {

    execute(

        context: BusinessContext,

        quote: QuoteResult

    ): Promise<QuoteResult>

}
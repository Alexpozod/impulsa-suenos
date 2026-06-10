import { BusinessModule } from "./types"
import { BusinessContext } from "../types"
import { QuoteResult } from "../../quote/types"

export class BaseModule
implements BusinessModule {

    async execute(

        context: BusinessContext,

        quote: QuoteResult

    ): Promise<QuoteResult> {

        return quote

    }

}
import { TrackingContext } from "../tracking/types"

export interface BusinessContext {

    raffleId: string

    quantity: number

    userId?: string | null

    tracking: TrackingContext

}
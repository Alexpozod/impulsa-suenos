import { PaymentProcessingContext } from "../types"

import {
  processRafflePayment
} from "@/lib/raffles/ledger/processRafflePayment"

const FLOW_FEE_RATE =
  0.0319

const IVA_RATE =
  0.19

export async function createLedger(
  context: PaymentProcessingContext
) {

  if (
    !context.payment ||
    !context.order
  ) {
    return context
  }

  const amount =
    Number(
      context.payment.amount_clp ??
      context.payment.amount ??
      0
    )

  const reportedProviderFee =
    Number(
      context.providerFee ??
      context.payment.provider_fee ??
      0
    )

  const internalProviderFee =
    Number(
      (
        amount *
        FLOW_FEE_RATE *
        (1 + IVA_RATE)
      ).toFixed(2)
    )

  const providerFee =
    reportedProviderFee > 0
      ? reportedProviderFee
      : internalProviderFee

  await processRafflePayment({

    payment_id:
      context.payment.id,

    raffle_id:
      context.order.raffle_id,

    order_id:
      context.order.id,

    amount,

    provider_fee:
      providerFee

  })

  return context

}
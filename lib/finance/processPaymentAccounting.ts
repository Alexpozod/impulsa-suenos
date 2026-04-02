import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processPaymentAccounting({
  paymentId,
  campaign_id,
  user_email,
  amount,
  platform_tip = 0,
  provider = "mercadopago",
}: any) {

  const gross = Number(amount) + Number(platform_tip)

  // comisión MercadoPago (ej: 2.96%)
  const providerFee = gross * 0.0296

  // comisión plataforma (fija)
  const platformFee = 300

  const net = gross - providerFee - platformFee

  /* =========================
     🧾 INSERT CONTABLE
  ========================= */

  await supabase.from("financial_ledger").insert([
    {
      campaign_id,
      user_email,
      type: "payment",
      flow_type: "payment_gross",
      amount: gross,
      gross_amount: gross,
      provider,
      payment_id: paymentId,
    },
    {
      campaign_id,
      user_email,
      type: "fee",
      flow_type: "payment_fee_mp",
      amount: -providerFee,
      provider_fee: providerFee,
      payment_id: paymentId,
    },
    {
      campaign_id,
      user_email,
      type: "fee",
      flow_type: "platform_fee",
      amount: -platformFee,
      platform_fee: platformFee,
      payment_id: paymentId,
    },
    {
      campaign_id,
      user_email,
      type: "net",
      flow_type: "net_user",
      amount: net,
      net_amount: net,
      payment_id: paymentId,
    }
  ])

  return {
    gross,
    providerFee,
    platformFee,
    net
  }
}
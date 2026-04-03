import { createClient } from "@supabase/supabase-js"
import { generateTicketCode } from "@/lib/tickets/generateTicketCode"

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

  /* =========================
     🛑 IDEMPOTENCIA TOTAL
  ========================= */
  const { data: exists } = await supabase
    .from("financial_ledger")
    .select("id")
    .eq("payment_id", paymentId)
    .maybeSingle()

  if (exists) {
    return { alreadyProcessed: true }
  }

  /* =========================
     💰 CÁLCULOS
  ========================= */
  const gross = Number(amount) + Number(platform_tip)

  const providerFee = gross * 0.0296
  const platformFee = 300
  const net = gross - providerFee - platformFee

  const now = new Date().toISOString()

  /* =========================
     🧾 LEDGER (FUENTE DE VERDAD)
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
      accounting_date: now,
    },
    {
      campaign_id,
      user_email,
      type: "fee",
      flow_type: "payment_fee_mp",
      amount: -providerFee,
      provider_fee: providerFee,
      payment_id: paymentId,
      accounting_date: now,
    },
    {
      campaign_id,
      user_email,
      type: "fee",
      flow_type: "platform_fee",
      amount: -platformFee,
      platform_fee: platformFee,
      payment_id: paymentId,
      accounting_date: now,
    },
    {
      campaign_id,
      user_email,
      type: "net",
      flow_type: "net_user",
      amount: net,
      net_amount: net,
      payment_id: paymentId,
      accounting_date: now,
    }
  ])

  /* =========================
     🎟️ GENERACIÓN DE TICKETS
  ========================= */

  // 📌 obtener prefix
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("code_prefix")
    .eq("id", campaign_id)
    .single()

  const prefix = campaign?.code_prefix || "CMP"

  // 📊 contar tickets actuales
  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaign_id)

  const startNumber = (count || 0) + 1

  // 🎯 cantidad de tickets (preparado para futuro)
  const ticketQuantity = 1

  const ticketsToInsert = []

  for (let i = 0; i < ticketQuantity; i++) {
    const ticketNumber = generateTicketCode(
      prefix,
      startNumber + i
    )

    ticketsToInsert.push({
      campaign_id,
      payment_id: paymentId,
      user_email,
      ticket_number: ticketNumber,
      created_at: now
    })
  }

  if (ticketsToInsert.length > 0) {
    await supabase.from("tickets").insert(ticketsToInsert)
  }

  /* =========================
     📦 RETURN
  ========================= */
  return {
    gross,
    providerFee,
    platformFee,
    net,
    tickets: ticketsToInsert.map(t => t.ticket_number)
  }
}
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { sendDonationEmail } from "@/lib/email"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT")

  try {

    let paymentId: string | null = null

    // 📩 BODY
    try {
      const body = await req.json()
      console.log("📩 BODY:", body)
      paymentId = body?.data?.id || body?.id || null
    } catch {
      console.log("⚠️ NO BODY")
    }

    // 🔍 FALLBACK
    if (!paymentId) {
      const url = new URL(req.url)
      paymentId =
        url.searchParams.get("data.id") ||
        url.searchParams.get("id")
    }

    if (!paymentId) {
      console.log("❌ NO PAYMENT ID")
      return NextResponse.json({ ok: false })
    }

    console.log("💳 PAYMENT ID:", paymentId)

    // 🔍 GET PAYMENT
    let payment
    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err) {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: "payment_not_found",
        payload: err
      })

      return NextResponse.json({ ok: false })
    }

    if (!payment || payment.status !== "approved") {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: payment?.status || "not_approved",
        payload: payment
      })

      return NextResponse.json({ ok: true })
    }

    // 💰 DATOS
    const total = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)
    const amount = total - tip

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.payer?.email ||
      payment.metadata?.user_email ||
      `guest_${payment.id}@impulsasuenos.com`

    const fee_mp =
      payment.fee_details?.reduce(
        (acc: number, f: any) => acc + Number(f.amount || 0),
        0
      ) || 0

    const platform_fee = Math.round(300 * 1.19)

    console.log("💰 total:", total)
    console.log("🎁 tip:", tip)
    console.log("❤️ donation:", amount)

    if (!campaign_id || !amount) {
      return NextResponse.json({ ok: false })
    }

    // 🔥 PROCESO PRINCIPAL
    const { data, error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: fee_mp,
      p_platform_fee: platform_fee,
      p_provider: "mercadopago"
    })

    if (error) {
      console.log("❌ RPC ERROR:", error)
      return NextResponse.json({ ok: false })
    }

    // 🎁 TIP (aislado para no romper flujo)
    if (tip > 0) {
      try {
        await supabase.from("financial_ledger").insert({
          campaign_id,
          type: "tip",
          flow_type: "in",
          amount: tip,
          status: "confirmed",
          provider: "mercadopago",
          payment_id: paymentId,
          user_email
        })
      } catch (e) {
        console.log("⚠️ ERROR TIP:", e)
      }
    }

    // 🔍 OBTENER NOMBRE CAMPAÑA (PRO)
    let campaign_name = campaign_id

    try {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title")
        .eq("id", campaign_id)
        .maybeSingle()

      if (campaign?.title) {
        campaign_name = campaign.title
      }
    } catch (e) {
      console.log("⚠️ ERROR FETCH CAMPAIGN:", e)
    }

    // 📧 EMAIL (CON LOG REAL)
    try {
      console.log("📧 intentando enviar email a:", user_email)

      await sendDonationEmail({
        to: user_email,
        campaign: campaign_name,
        amount
      })

      console.log("✅ EMAIL ENVIADO")

    } catch (err) {
      console.log("❌ EMAIL ERROR:", err)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {

    console.error("🔥 ERROR GENERAL:", err)

    return NextResponse.json({ ok: false })
  }
}
import { MercadoPagoConfig, Preference } from "mercadopago"

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {
  console.error("❌ MERCADOPAGO_ACCESS_TOKEN NO DEFINIDO")
}

const mpClient = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null

const mpPreference = mpClient ? new Preference(mpClient) : null

export async function createPayment({
  amount,
  tip = 0,
  campaign_id,
  user_email,
  provider,
  message,
  donor_name,

  // 🔥 NUEVO (NO ROMPE)
  metadata = {}
}: any) {

  switch ((provider || "mercadopago").toLowerCase()) {

    case "mercadopago":
      return createMercadoPagoPayment({
        amount,
        tip,
        campaign_id,
        user_email,
        message,
        donor_name,
        metadata // 🔥 CLAVE
      })

    default:
      return {
        error: "Provider no válido"
      }
  }
}

async function createMercadoPagoPayment({
  amount,
  tip = 0,
  campaign_id,
  user_email,
  message,
  donor_name,
  metadata = {} // 🔥 NUEVO
}: any) {

  if (!mpPreference) {
    return { error: "MercadoPago no configurado" }
  }

  try {

    const safeAmount = Number(amount) || 0
    const safeTip = Number(tip) || 0
    const total = safeAmount + safeTip

    if (total <= 0) {
      return { error: "Monto inválido" }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!baseUrl) {
      return { error: "BASE URL no definida" }
    }

    const finalDonorName =
      donor_name?.trim() ||
      user_email?.split("@")[0] ||
      "Donador"

    const finalMessage =
      typeof message === "string" && message.trim().length > 0
        ? message.trim()
        : null

    /* =========================
       🔥 TRACKING REAL (FIX FINAL)
    ========================= */

    const referrer =
      metadata?.ref ||
      metadata?.referrer ||
      null

    const source =
      metadata?.source ||
      metadata?.traffic_source ||
      "direct"

    /* =========================
       🚀 CREAR PREFERENCE
    ========================= */

    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: "donation",
            title: "Donación ImpulsaSueños",
            quantity: 1,
            unit_price: total,
          },
        ],

        payer: {
          email: user_email
        },

        metadata: {
          campaign_id,
          user_email,
          amount: safeAmount,
          tip: safeTip,

          donor_name: finalDonorName,
          message: finalMessage,
          message_text: finalMessage,

          // 🔥 AQUÍ ESTÁ EL FIX REAL
          ref: referrer,
          referrer: referrer,
          source: source,
          traffic_source: source
        },

        external_reference: campaign_id,

        notification_url: `${baseUrl}/api/webhook`,

        back_urls: {
          success: `${baseUrl}/payment/success?amount=${total}`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },

        auto_return: "approved",
      },
    })

    return {
      id: preference.id,
      init_point: preference.init_point
    }

  } catch (error) {

    console.error("❌ MERCADOPAGO ERROR:", error)

    return {
      error: "Error creando pago"
    }
  }
}
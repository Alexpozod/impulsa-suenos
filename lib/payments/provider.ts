import { MercadoPagoConfig, Preference } from "mercadopago"

/* =========================
   🔌 MERCADOPAGO CONFIG
========================= */
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {
  console.error("❌ MERCADOPAGO_ACCESS_TOKEN NO DEFINIDO")
}

const mpClient = accessToken
  ? new MercadoPagoConfig({
      accessToken,
    })
  : null

const mpPreference = mpClient ? new Preference(mpClient) : null

/* =========================
   🎯 MAIN ENTRY
========================= */
export async function createPayment({
  amount,
  tip = 0, // 🔥 CAMBIO
  campaign_id,
  user_email,
  provider,
}: any) {

  switch (provider) {

    case "mercadopago":
      return createMercadoPagoPayment({
        amount,
        tip,
        campaign_id,
        user_email,
      })

    default:
      return {
        error: "Provider no válido"
      }
  }
}

/* =========================
   💳 MERCADOPAGO
========================= */
async function createMercadoPagoPayment({
  amount,
  tip = 0,
  campaign_id,
  user_email,
}: any) {

  if (!mpPreference) {
    return {
      error: "MercadoPago no configurado"
    }
  }

  try {

    // 🔥 FIX CRÍTICO
    const safeAmount = Number(amount) || 0
    const safeTip = Number(tip) || 0

    const total = safeAmount + safeTip

    if (total <= 0) {
      return { error: "Monto inválido" }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!baseUrl) {
      return {
        error: "BASE URL no definida"
      }
    }

    console.log("💰 MP TOTAL:", total)
    console.log("WEBHOOK URL:", `${baseUrl}/api/webhook`)

    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: "donation",
            title: "Donación ImpulsaSueños",
            quantity: 1,
            unit_price: total, // ✅ ahora SIEMPRE number
          },
        ],

        metadata: {
          campaign_id,
          user_email,
          amount: safeAmount,
          tip: safeTip, // 🔥 IMPORTANTE (ANTES ERA platform_tip)
        },

        external_reference: campaign_id,

        notification_url: `${baseUrl}/api/webhook`,

        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },

        auto_return: "approved",
      },
    })

    return {
      id: preference.id,
      init_point: preference.init_point // 🔥 importante
    }

  } catch (error) {
    console.error("❌ MERCADOPAGO ERROR:", error)

    return {
      error: "Error creando pago"
    }
  }
}
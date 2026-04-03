import { MercadoPagoConfig, Preference } from "mercadopago"

/* =========================
   🔌 MERCADOPAGO CONFIG
========================= */
const mpClient = process.env.MERCADOPAGO_ACCESS_TOKEN
  ? new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })
  : null

const mpPreference = mpClient ? new Preference(mpClient) : null

/* =========================
   🎯 MAIN ENTRY
========================= */
export async function createPayment({
  amount,
  platform_tip,
  campaign_id,
  user_email,
  provider,
  baseUrl
}: any) {

  switch (provider) {

    case "mercadopago":
      return createMercadoPagoPayment({
        amount,
        platform_tip,
        campaign_id,
        user_email,
        baseUrl
      })

    case "stripe":
      return {
        error: "Stripe no implementado aún"
      }

    case "paypal":
      return {
        error: "PayPal no implementado aún"
      }

    case "crypto":
      return {
        error: "Crypto no implementado aún"
      }

    default:
      throw new Error("Provider no válido")
  }
}

/* =========================
   💳 MERCADOPAGO
========================= */
async function createMercadoPagoPayment({
  amount,
  platform_tip,
  campaign_id,
  user_email,
  baseUrl
}: any) {

  if (!mpPreference) {
    throw new Error("MercadoPago no configurado")
  }

  const total = Number(amount) + Number(platform_tip)

  const preference = await mpPreference.create({
    body: {
      items: [
        {
          id: "donation",
          title: "🎟️ Donación / Campaña",
          quantity: 1,
          unit_price: total,
        },
      ],

      metadata: {
        campaign_id,
        user_email,
        amount: Number(amount),
        platform_tip: Number(platform_tip),
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
    url: preference.init_point
  }
}
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
  platform_tip,
  campaign_id,
  user_email,
  baseUrl
}: any) {

  if (!mpPreference) {
    return {
      error: "MercadoPago no configurado (falta access token)"
    }
  }

  try {

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

  } catch (error) {
    console.error("❌ MERCADOPAGO ERROR:", error)

    return {
      error: "Error creando preferencia de pago"
    }
  }
}
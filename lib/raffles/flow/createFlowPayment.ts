import axios from "axios"
import CryptoJS from "crypto-js"

function signParams(params: Record<string, string>) {
  const toSign = Object.keys(params).sort()
    .map(key => `${key}${params[key]}`).join("")
  return CryptoJS.HmacSHA256(toSign, process.env.FLOW_SECRET_KEY!).toString()
}

type FlowCreateResult = {
  token?: string
  url?: string
  flowOrder?: string | number
  error?: boolean
}

export async function createFlowPayment({
  orderId, amount, email, subject
}: {
  orderId: string
  amount: number
  email: string
  subject: string
}): Promise<FlowCreateResult> {
  const params: Record<string, string> = {
    apiKey: String(process.env.FLOW_API_KEY || ""),
    commerceOrder: orderId,
    subject,
    currency: "CLP",
    amount: String(amount),
    email,
    urlConfirmation: String(process.env.NEXT_PUBLIC_FLOW_CONFIRMATION_URL || ""),
    urlReturn: String(process.env.NEXT_PUBLIC_FLOW_RETURN_URL || "")
  }

  if (!params.apiKey || !process.env.FLOW_SECRET_KEY ||
      !process.env.FLOW_BASE_URL ||
      !params.urlConfirmation || !params.urlReturn) {
    console.error("raffles_flow_configuration_missing")
    return { error: true }
  }

  const body = new URLSearchParams({ ...params, s: signParams(params) })

  try {
    const response = await axios.post(
      `${process.env.FLOW_BASE_URL}/payment/create`,
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    const data = response.data
    if (typeof data?.token !== "string" || typeof data?.url !== "string") {
      console.error("raffles_flow_response_invalid")
      return { error: true }
    }
    // Never log or return the HMAC signature, private API key or Flow request body.
    return { token: data.token, url: data.url, flowOrder: data.flowOrder }
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    console.error("raffles_flow_create_failed", status ?? "unknown")
    return { error: true }
  }
}

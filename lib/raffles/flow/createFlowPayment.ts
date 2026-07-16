import axios from "axios"

const CryptoJS = require("crypto-js")

function signParams(
  params: Record<string, any>
) {

  const keys =
    Object.keys(params).sort()

  const toSign =
    keys
      .map(
        k => `${k}${params[k]}`
      )
      .join("")

  return CryptoJS.HmacSHA256(

    toSign,

    process.env
      .FLOW_SECRET_KEY!

  ).toString()
}

export async function createFlowPayment({

  orderId,
  amount,
  email,
  subject

}: {

  orderId: string
  amount: number
  email: string
  subject: string

}) {

  const params = {

    apiKey:
      process.env.FLOW_API_KEY,

    commerceOrder:
      orderId,

    subject,

    currency:
      "CLP",

    amount,

    email,

    urlConfirmation:
      process.env
        .NEXT_PUBLIC_FLOW_CONFIRMATION_URL,

    urlReturn:
      process.env
        .NEXT_PUBLIC_FLOW_RETURN_URL
  }

  console.log(
  "FLOW RETURN URL",
  params.urlReturn
)

console.log(
  "FLOW CONFIRM URL",
  params.urlConfirmation
)

const s =
  signParams(params)

  const body =
    new URLSearchParams({

      apiKey:
        String(params.apiKey),

      commerceOrder:
        String(params.commerceOrder),

      subject:
        String(params.subject),

      currency:
        String(params.currency),

      amount:
        String(params.amount),

      email:
        String(params.email),

      urlConfirmation:
        String(params.urlConfirmation),

      urlReturn:
        String(params.urlReturn),

      s:
        String(s)

    })

  console.log(
    "FLOW PARAMS",
    params
  )

  console.log(
    "FLOW SIGNATURE",
    s
  )

  console.log(
    "FLOW BODY",
    body.toString()
  )

  console.log(
    "FLOW URL",
    `${process.env.FLOW_BASE_URL}/payment/create`
    )

    console.log(
  "FLOW BASE URL",
  process.env.FLOW_BASE_URL
)

console.log(
  "FLOW API KEY",
  process.env.FLOW_API_KEY?.substring(0, 8)
)

  console.log(
  "FLOW API KEY",
  process.env.FLOW_API_KEY?.substring(0,8)
)

console.log(
  "FLOW BASE URL",
  process.env.FLOW_BASE_URL
)

  let response

  try {

    console.error("FLOW DEBUG", {
  baseUrl: process.env.FLOW_BASE_URL,
  apiKey: process.env.FLOW_API_KEY?.substring(0, 8),
  endpoint: `${process.env.FLOW_BASE_URL}/payment/create`
})

console.error("FLOW DEBUG", {
  baseUrl: process.env.FLOW_BASE_URL,
  apiKey: process.env.FLOW_API_KEY?.substring(0, 8),
  endpoint: `${process.env.FLOW_BASE_URL}/payment/create`
})

response =
  await axios.post(

    `${process.env.FLOW_BASE_URL}/payment/create`,

    body,

    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      }
    }
  )

    console.log(
  "FLOW SUCCESS RESPONSE",
  JSON.stringify(response.data, null, 2)
)

console.log(
  "FLOW ORDER DEBUG",
  {
    commerceOrder: orderId,
    token: response.data?.token,
    flowOrder: response.data?.flowOrder
  }
)

  } catch (error: any) {

  console.error(
    "FLOW AXIOS ERROR DATA",
    error?.response?.data
  )

  console.error(
    "FLOW AXIOS ERROR STATUS",
    error?.response?.status
  )

  console.error(
    "FLOW AXIOS ERROR HEADERS",
    error?.response?.headers
  )

  console.error(
    "FLOW AXIOS FULL ERROR",
    error
  )

  return {

    error: true,

    status:
      error?.response?.status,

    data:
      error?.response?.data

  }

}

  console.log(
  "FLOW RESPONSE URL",
  response.data.url
)

console.log(
  "FLOW RESPONSE",
  JSON.stringify(response.data, null, 2)
)

return response.data
}
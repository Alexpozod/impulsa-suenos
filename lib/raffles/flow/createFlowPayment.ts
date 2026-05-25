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

  const s =
    signParams(params)

  console.log(
    "FLOW PARAMS",
    params
  )

  console.log(
    "FLOW SIGNATURE",
    s
  )

  console.log(
    "FLOW URL",
    `${process.env.FLOW_BASE_URL}/payment/create`
  )

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

  let response

  try {

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

  } catch (error: any) {

    console.error(
      "FLOW AXIOS ERROR",
      error?.response?.data ||
      error
    )

    throw new Error(
      JSON.stringify(
        error?.response?.data ||
        error
      )
    )
  }

  return response.data
}
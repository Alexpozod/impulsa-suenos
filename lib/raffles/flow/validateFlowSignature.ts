const CryptoJS = require("crypto-js")

export function validateFlowSignature(
  params: Record<string, any>
) {

  const receivedSignature = params.s

  delete params.s

  const keys = Object.keys(params).sort()

  const toSign = keys
    .map(k => `${k}${params[k]}`)
    .join("")

  const expectedSignature =
    CryptoJS.HmacSHA256(
      toSign,
      process.env.FLOW_SECRET_KEY!
    ).toString()

  return expectedSignature === receivedSignature
}
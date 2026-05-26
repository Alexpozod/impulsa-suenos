import CryptoJS from "crypto-js"

export function validateFlowSignature(
  rawParams: Record<string, any>
) {

  const params = {
    ...rawParams
  }

  const receivedSignature =
    String(params.s || "")

  delete params.s

  const keys =
    Object.keys(params)
      .filter(
        key =>
          params[key] !== undefined &&
          params[key] !== null
      )
      .sort()

  const toSign =
    keys
      .map(
        key =>
          `${key}${String(params[key])}`
      )
      .join("")

  const expectedSignature =
    CryptoJS.HmacSHA256(

      toSign,

      process.env
        .FLOW_SECRET_KEY!

    ).toString()

  console.log(
    "FLOW WEBHOOK SIGN VALIDATION",
    {
      receivedSignature,
      expectedSignature,
      toSign
    }
  )

  const valid =
  expectedSignature ===
  receivedSignature

console.log(
  "FLOW SIGNATURE DEBUG",
  {
    valid,
    receivedSignature,
    expectedSignature,
    toSign,
    params
  }
)

return valid
}
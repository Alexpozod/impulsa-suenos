import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface FinancialSettings {

  vatPercent: number

  flowFeePercent: number

  mercadoPagoFeePercent: number

}

export async function getFinancialSettings():

Promise<FinancialSettings> {

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("financial_settings")
      .select("*")
      .eq(
        "id",
        "00000000-0000-0000-0000-000000000001"
      )
      .single()

  if (error || !data) {

    throw new Error(
      "financial_settings_not_configured"
    )

  }

  return {

    vatPercent:
      Number(data.vat_percent),

    flowFeePercent:
      Number(data.flow_fee_percent),

    mercadoPagoFeePercent:
      Number(data.mercadopago_fee_percent)

  }

}
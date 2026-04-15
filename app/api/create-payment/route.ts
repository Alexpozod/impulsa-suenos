import { NextResponse } from "next/server"
import { z } from "zod"
import { createPayment } from "@/lib/payments/provider"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
  amount: z.number().positive(),
  tip: z.number().optional(),
  campaign_id: z.string(),
  user_email: z.string().email(),
  message: z.string().max(300).optional()
})

export async function POST(req: Request) {
  try {

    const body = await req.json()
    const parsed = schema.parse(body)

    const { amount, tip = 0, campaign_id, user_email, message = "" } = parsed

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, status")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign || campaign.status !== "active") {
      return NextResponse.json({ error: "Campaña inválida" }, { status: 400 })
    }

    const result = await createPayment({
      amount,
      tip,
      campaign_id,
      user_email,
      message
    })

    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
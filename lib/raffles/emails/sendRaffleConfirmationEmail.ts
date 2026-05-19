import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function sendRaffleConfirmationEmail(

  order_id: string

) {

  try {

    const { data: order } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          *,
          raffles (
            title,
            slug,
            cover_image
          )
        `)
        .eq("id", order_id)
        .maybeSingle()

    if (!order) return

    const { data: tickets } =
      await supabase
        .schema("raffles")
        .from("tickets")
        .select(`
          ticket_code
        `)
        .eq("order_id", order_id)

    console.log(
      "EMAIL RAFFLE",
      {
        to: order.user_email,
        raffle:
          order.raffles?.title,
        tickets
      }
    )

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        confirmation_email_sent: true,

        confirmation_email_sent_at:
          new Date().toISOString()

      })
      .eq("id", order_id)

  } catch (error) {

    console.error(
      "sendRaffleConfirmationEmail",
      error
    )
  }
}
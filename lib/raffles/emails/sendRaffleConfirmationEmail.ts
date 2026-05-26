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

    /* =========================================
       LOAD ORDER + RAFFLE
    ========================================= */

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

    if (!order) {
      return
    }

    /* =========================================
       LOAD PAID TICKETS
    ========================================= */

    const { data: tickets } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          ticket_code,
          ticket_number
        `)
        .eq("order_id", order_id)
        .eq("status", "paid")

    console.log(
      "EMAIL RAFFLE",
      {
        to:
          order.buyer_email,

        raffle:
          order.raffles?.title,

        tickets
      }
    )

    /* =========================================
       MARK EMAIL SENT
    ========================================= */

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
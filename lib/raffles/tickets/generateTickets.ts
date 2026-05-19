import { createClient }
from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function randomNumber(min: number, max: number) {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min
}

export async function generateTickets({

  order_id,
  raffle_id,
  quantity

}: {

  order_id: string
  raffle_id: string
  quantity: number

}) {

  const { data: raffle } = await supabase
    .schema("raffles")
    .from("raffles")
    .select("*")
    .eq("id", raffle_id)
    .maybeSingle()

  if (!raffle) {
    throw new Error("raffle_not_found")
  }

  const generated = []

  for (let i = 0; i < quantity; i++) {

    let ticketNumber = ""
    let exists = true

    while (exists) {

      ticketNumber =
        String(
          randomNumber(
            raffle.ticket_min_number,
            raffle.ticket_max_number
          )
        )

      const { data } = await supabase
        .schema("raffles")
        .from("tickets")
        .select("id")
        .eq("raffle_id", raffle_id)
        .eq("ticket_number", ticketNumber)
        .maybeSingle()

      exists = !!data
    }

    const code =
      `${raffle.ticket_prefix}-${ticketNumber}`

    const { data: ticket } = await supabase
      .schema("raffles")
      .from("tickets")
      .insert({

        raffle_id,
        order_id,

        ticket_number: ticketNumber,

        ticket_code: code,

        status: "active"

      })
      .select()
      .single()

    generated.push(ticket)
  }

  return generated
}
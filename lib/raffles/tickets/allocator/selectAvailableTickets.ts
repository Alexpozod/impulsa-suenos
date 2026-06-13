import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function selectAvailableTickets(

  raffleId: string,

  quantity: number

) {

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        ticket_code,
        ticket_number
      `)
      .eq("raffle_id", raffleId)
      .eq("status", "available")
      .order(
        "ticket_number",
        {
          ascending: true
        }
      )
      .limit(quantity)

  if (error) {

    throw error

  }

  return data ?? []

}
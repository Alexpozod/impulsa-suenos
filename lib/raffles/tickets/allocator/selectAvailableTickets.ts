import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function selectAvailableTickets(

  raffleId: string,

  quantity: number

) {

  // Obtener el ticket más alto del sorteo

  const {
    data: maxTicket,
    error: maxError
  } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("ticket_number")
      .eq("raffle_id", raffleId)
      .order(
        "ticket_number",
        {
          ascending: false
        }
      )
      .limit(1)
      .maybeSingle()

  if (maxError) {

    throw maxError

  }

  const maxNumber =
    maxTicket?.ticket_number ?? 1

  const randomStart =
    Math.floor(
      Math.random() * maxNumber
    ) + 1

  // Buscar disponibles desde el punto aleatorio

  const {
    data: firstBatch,
    error: firstError
  } =
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
      .gte(
        "ticket_number",
        randomStart
      )
      .order(
        "ticket_number",
        {
          ascending: true
        }
      )
      .limit(quantity)

  if (firstError) {

    throw firstError

  }

  let tickets =
    firstBatch ?? []

  // Si no alcanzan, completar desde el inicio

  if (
    tickets.length < quantity
  ) {

    const remaining =
      quantity - tickets.length

    const {
      data: secondBatch,
      error: secondError
    } =
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
        .lt(
          "ticket_number",
          randomStart
        )
        .order(
          "ticket_number",
          {
            ascending: true
          }
        )
        .limit(remaining)

    if (secondError) {

      throw secondError

    }

    tickets = [
      ...tickets,
      ...(secondBatch ?? [])
    ]

  }

  // Mezclar el orden para aumentar
  // la percepción de aleatoriedad

  tickets.sort(
    () => Math.random() - 0.5
  )

  return tickets

}
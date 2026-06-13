import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function validateReservation(

  reservationToken: string,

  expectedQuantity: number

) {

  const { count } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("*", {

        count: "exact",

        head: true

      })
      .eq(
        "reservation_token",
        reservationToken
      )

  if (

    (count || 0) !== expectedQuantity

  ) {

    throw new Error(
      "reservation_race_condition"
    )

  }

}
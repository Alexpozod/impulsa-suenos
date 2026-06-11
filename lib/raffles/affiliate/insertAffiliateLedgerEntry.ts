import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function insertAffiliateLedgerEntry(

  ledgerEntry: any

){

  try{

    const existing =
      await supabase
        .schema("raffles")
        .from("ledger")
        .select("id")
        .eq(
          "payment_id",
          ledgerEntry.payment_id
        )
        .eq(
          "type",
          "affiliate_commission"
        )
        .maybeSingle()

    if(existing.data){

      return{

        inserted:false,

        reason:"duplicate"

      }

    }

    const { error } =
      await supabase
        .schema("raffles")
        .from("ledger")
        .insert(ledgerEntry)

    if(error){

      throw error

    }

    return{

      inserted:true

    }

  }

  catch(error){

    console.error(

      "insertAffiliateLedgerEntry",

      error

    )

    return{

      inserted:false,

      reason:"error"

    }

  }

}
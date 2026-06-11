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
    .select("id,status,metadata")
    .eq(
      "payment_id",
      ledgerEntry.payment_id
    )
    .eq(
      "type",
      "affiliate_commission"
    )
    .maybeSingle()

    if (existing.data) {

  console.log(

    "AFFILIATE_COMMISSION_ALREADY_EXISTS",

    ledgerEntry.payment_id

  )

  return {

    inserted: false,

    reason: "duplicate",

    existing: existing.data

  }

}

ledgerEntry.metadata = {

  ...(ledgerEntry.metadata || {}),

  createdBy:
    "affiliate_engine",

  createdAt:
    new Date().toISOString()

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

  inserted:true,

  ledgerEntry

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
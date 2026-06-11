import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processAffiliateCommission({

  payment_id,
  order_id,
  raffle_id

}:{

  payment_id:string

  order_id:string

  raffle_id:string

}){

  try{

    /*
      Sprint 1

      Este módulo aún no modifica
      el ledger.

      Solo será el punto oficial
      para calcular comisiones.

      Toda la lógica futura vivirá aquí.
    */

    return{

      processed:false,

      reason:"not_implemented"

    }

  }

  catch(error){

    console.error(

      "processAffiliateCommission",

      error

    )

    return{

      processed:false,

      reason:"error"

    }

  }

}
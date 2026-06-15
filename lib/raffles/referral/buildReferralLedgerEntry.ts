export function buildReferralLedgerEntry({

  raffle_id,

  order_id,

  payment_id,

  referral_id,

  referral_code,

  reward_amount

}:{

  raffle_id:string

  order_id:string

  payment_id:string

  referral_id:string

  referral_code:string

  reward_amount:number

}){

  return{

    raffle_id,

    order_id,

    payment_id,

    type:"referral_reward",

    flow_type:"out",

    amount_clp:-reward_amount,

    status:"confirmed",

    metadata:{

      referralId:

        referral_id,

      referralCode:

        referral_code

    }

  }

}
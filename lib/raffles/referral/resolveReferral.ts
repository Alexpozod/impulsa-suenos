import { ReferralResult } from "./types"

export async function resolveReferral(

  referralCode?: string | null

): Promise<ReferralResult> {

  /*
      Próximamente consultará:

      raffles.referral_programs

      raffles.referrals

      raffles.referral_rewards

      Hoy solamente centralizamos
      la lógica.
  */

  if (!referralCode) {

    return {

      found: false

    }

  }

  return {

    found: true,

    referralCode,

    rewardType: "ticket",

    rewardValue: 1

  }

}
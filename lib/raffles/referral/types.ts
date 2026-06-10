export interface ReferralResult {

  found: boolean

  referralId?: string

  referralCode?: string

  rewardType?: "ticket" | "amount" | "percentage"

  rewardValue?: number

}
export function evaluateCampaignRisk(campaign: any) {
  const flags: string[] = []

  if (campaign.raised > 100000 && !campaign.verified) {
    flags.push("unverified_high_volume")
  }

  if (campaign.spent > campaign.raised) {
    flags.push("overspending")
  }

  if (campaign.status === "flagged") {
    flags.push("manual_flag")
  }

  return {
    safe: flags.length === 0,
    flags
  }
}

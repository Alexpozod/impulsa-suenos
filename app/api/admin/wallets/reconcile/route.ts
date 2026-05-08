import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { syncWallet } from "@/lib/wallet/syncWallet"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {

  try {

    const { data: users, error } = await supabase
      .from("wallets")
      .select("user_email")

    if (error) {
      return NextResponse.json(
        { error: "wallet users error" },
        { status: 500 }
      )
    }

    let updated = 0

    for (const user of users || []) {

      if (!user.user_email) continue

      await syncWallet(user.user_email)

      updated++
    }

    return NextResponse.json({
      ok: true,
      updated
    })

  } catch (error) {

    console.error("RECONCILE ERROR:", error)

    return NextResponse.json(
      { error: "reconcile failed" },
      { status: 500 }
    )
  }
}
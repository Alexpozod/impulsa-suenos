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

    /* =========================
       👤 TODOS LOS USERS REALES
    ========================= */
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("user_email")

    if (error) {
      return NextResponse.json(
        { error: "campaign users error" },
        { status: 500 }
      )
    }

    /* =========================
       🧠 EMAILS ÚNICOS
    ========================= */
    const uniqueEmails = Array.from(
      new Set(
        (campaigns || [])
          .map(c => c.user_email)
          .filter(Boolean)
      )
    )

    /* =========================
       🔄 SYNC USERS
    ========================= */
    let updated = 0

    for (const email of uniqueEmails) {

      await syncWallet(email)

      updated++
    }

    /* =========================
       🏦 PLATFORM
    ========================= */
    await syncWallet("platform")

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
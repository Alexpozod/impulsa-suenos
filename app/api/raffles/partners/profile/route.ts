import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {

  try {

    const user =
      await requireUser(req)

    const email =
      user.email?.toLowerCase()

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("id")
        .eq("owner_email", email)
        .maybeSingle()

    if (!affiliate) {

      return NextResponse.json({
        ok: false,
        error: "affiliate_not_found"
      })

    }

    const { data: profile } =
      await supabase
        .schema("raffles")
        .from("partner_profiles")
        .select("*")
        .eq(
          "affiliate_id",
          affiliate.id
        )
        .maybeSingle()

    return NextResponse.json({
      ok: true,
      profile
    })

  } catch (error: any) {

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "server_error"
      },
      {
        status: 401
      }
    )

  }

}

export async function POST(req: Request) {

  try {

    const user =
      await requireUser(req)

    const body =
      await req.json()

    const email =
      user.email?.toLowerCase()

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("id")
        .eq("owner_email", email)
        .maybeSingle()

    if (!affiliate) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "affiliate_not_found"
        },
        {
          status: 404
        }
      )

    }

    const { data: existing } =
  await supabase
    .schema("raffles")
    .from("partner_profiles")
    .select(`
      profile_locked,
      edit_window_until
    `)
    .eq(
      "affiliate_id",
      affiliate.id
    )
    .maybeSingle()

// Existing bank profiles may only be changed during an OTP-approved window.
    // The initial creation of an absent profile remains supported.
    // A first-time partner must pass OTP to create an unlocked shell via
    // raffles.unlock_partner_profile before any bank details may be saved.
    if (!existing || existing.profile_locked !== false) {
      return NextResponse.json({ ok: false, error: "profile_locked" }, { status: 403 })
    }
    const expiry = existing.edit_window_until
      ? new Date(existing.edit_window_until).getTime() : NaN
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      return NextResponse.json({ ok: false, error: "edit_window_expired" }, { status: 403 })
    }

    const payload = {

  affiliate_id:
    affiliate.id,

  affiliate_type:
    body.affiliate_type ||
    "person",

  first_name:
    body.first_name,

  last_name:
    body.last_name,

  phone:
    body.phone,

  rut:
    body.rut,

  bank_name:
    body.bank_name,

  account_type:
    body.account_type,

  account_number:
    body.account_number,

  account_holder:
    body.account_holder,

  company_name:
    body.company_name,

  company_rut:
    body.company_rut,

  company_business:
    body.company_business,

  legal_representative:
    body.legal_representative,

  company_email:
    body.company_email,

  profile_locked: true,

  edit_window_until: null,

  updated_at:
    new Date().toISOString()

}

    // Atomic predicate rechecks the 15-minute OTP window at write time.
    const { data: saved, error } = await supabase
      .schema("raffles")
      .from("partner_profiles")
      .update(payload)
      .eq("affiliate_id", affiliate.id)
      .eq("profile_locked", false)
      .gt("edit_window_until", new Date().toISOString())
      .select("id")
      .maybeSingle()

    if (error) throw error
    if (!saved) {
      return NextResponse.json(
        { ok: false, error: "edit_window_expired" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ok: true
    })

  } catch (error: any) {

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "server_error"
      },
      {
        status: 500
      }
    )

  }

}
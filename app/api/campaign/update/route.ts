import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    /* =========================
       🔐 AUTH (BIEN UBICADO)
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase()

    /* =========================
       📥 BODY
    ========================= */
    const body = await req.json()

    const {
      id,
      title,
      description,
      image_url,
      images
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    /* =========================
       🔐 VALIDAR DUEÑO (CRÍTICO)
    ========================= */
    const { data: campaignOwner } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", id)
      .maybeSingle()

    if (!campaignOwner || campaignOwner.user_email !== user_email) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 })
    }

    /* =========================
       📊 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("current_amount")
      .eq("id", id)
      .single()

    const hasMoney = Number(campaign?.current_amount || 0) > 0

    /* =========================
       🧠 NORMALIZAR
    ========================= */
    const finalImages = images?.length ? images : [image_url]
    const cover = finalImages?.[0] || null

    /* =========================
       🔥 SI NO HAY DINERO → DIRECTO
    ========================= */
    if (!hasMoney) {

      await supabase
        .from("campaigns")
        .update({
          title,
          description,
          image_url: cover,
          images: finalImages,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)

      return NextResponse.json({ ok: true, mode: "direct" })
    }

    /* =========================
       🚨 SI HAY DINERO → PENDIENTE
    ========================= */
    await supabase.from("campaign_updates").insert({
      campaign_id: id,
      title,
      description,
      image_url: cover,
      images: finalImages,
      status: "pending"
    })

    return NextResponse.json({
      ok: true,
      mode: "pending_approval"
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
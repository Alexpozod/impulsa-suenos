import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const body = await req.json()

    const {
      id,
      title,
      description,
      image_url
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("campaigns")
      .update({
        title,
        description,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
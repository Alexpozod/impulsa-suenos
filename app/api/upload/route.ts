import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "file requerido" }, { status: 400 })
    }

    /* =========================
       🧠 VALIDACIONES
    ========================= */
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "solo imágenes" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "máx 5MB" }, { status: 400 })
    }

    /* =========================
       📦 SUBIR A STORAGE
    ========================= */
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`

    const { error } = await supabase.storage
      .from("campaign-images")
      .upload(fileName, file)

    if (error) {
      return NextResponse.json({ error: "upload error" }, { status: 500 })
    }

    const { data } = supabase.storage
      .from("campaign-images")
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: data.publicUrl
    })

  } catch (error) {

    console.error("UPLOAD ERROR:", error)

    return NextResponse.json(
      { error: "error upload" },
      { status: 500 }
    )
  }
}
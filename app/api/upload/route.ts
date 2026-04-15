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
    const bucket = formData.get("bucket") as string
    const path = formData.get("path") as string

    if (!file) {
      return NextResponse.json({ error: "file requerido" }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: "bucket requerido" }, { status: 400 })
    }

    if (!path) {
      return NextResponse.json({ error: "path requerido" }, { status: 400 })
    }

    /* =========================
       VALIDACIONES
    ========================= */
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "solo imágenes" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "máx 5MB" }, { status: 400 })
    }

    /* =========================
       CONVERTIR FILE → BUFFER
    ========================= */
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    /* =========================
       SUBIR A STORAGE (DINÁMICO)
    ========================= */
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error("UPLOAD ERROR:", error)
      return NextResponse.json({ error: "upload error" }, { status: 500 })
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({
      url: data.publicUrl,
      path
    })

  } catch (error) {

    console.error("UPLOAD ERROR:", error)

    return NextResponse.json(
      { error: "error upload" },
      { status: 500 }
    )
  }
}
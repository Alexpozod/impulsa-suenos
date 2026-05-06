import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const { bucket, path } = await req.json()

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "missing data" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60)

    if (error) {
      console.error(error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: data.signedUrl
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "signed url error" },
      { status: 500 }
    )
  }
}
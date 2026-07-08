import { NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  try {

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("public_site_settings")
        .select("*")
        .eq(
          "id",
          "00000000-0000-0000-0000-000000000001"
        )
        .single()

    if (error) {

      throw error

    }

    return NextResponse.json(data)

  }

  catch (error) {

    console.error(
      "public site settings",
      error
    )

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )

  }

}

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const { error } =
      await supabase
        .schema("raffles")
        .from("public_site_settings")
        .update({

          title:
            body.title,

          subtitle:
            body.subtitle,

          description:
            body.description,

          updated_at:
            new Date().toISOString()

        })

        .eq(
          "id",
          "00000000-0000-0000-0000-000000000001"
        );

    if (error) {

      throw error;

    }

    return NextResponse.json({

      success: true

    });

  }

  catch (error) {

    console.error(

      "public site update",

      error

    );

    return NextResponse.json(

      {

        error: "server_error"

      },

      {

        status: 500

      }

    );

  }

}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { requireAdminAccess } from "@/lib/raffles/admin/requireAdminAccess";

export const runtime = "nodejs";

const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.SUPABASE_SERVICE_ROLE_KEY!

);

export async function GET(req: Request) {

  try {

    const auth =
      await requireAdminAccess(req);

    if (!auth.authorized || !auth.user) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );

    }

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("partner_notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      throw error;

    }

    return NextResponse.json({

      ok: true,

      notifications:
        data || []

    });

  } catch (error) {

    console.error(error);

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

export async function POST(req: Request) {

  try {

    const auth =
      await requireAdminAccess(req);

    if (!auth.authorized || !auth.user) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );

    }

    const body =
      await req.json();

    const {

      title,

      message,

      send_email

    } = body;

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("partner_notifications")
        .insert({

          title,

          message,

          send_email:
            send_email ?? false,

          created_by:
            auth.user.id

        })

        .select()

        .single();

    if (error) {

      throw error;

    }

    return NextResponse.json({

      ok: true,

      notification: data

    });

  } catch (error) {

    console.error(error);

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
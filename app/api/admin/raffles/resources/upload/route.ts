import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { requireAdminAccess } from "@/lib/raffles/admin/requireAdminAccess";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {

    const auth =
      await requireAdminAccess(req);

    if (
  !auth.authorized ||
  !auth.user
) {

  return NextResponse.json(
    {
      error: "unauthorized"
    },
    {
      status: 401
    }
  );

}

    const form =
      await req.formData();

    const file =
      form.get("file") as File;

    const title =
      String(form.get("title") || "").trim();

    const description =
      String(form.get("description") || "").trim();

    const category =
      String(form.get("category") || "").trim();

    const sortOrder =
      Number(form.get("sortOrder") || 0);

    if (!file) {

      return NextResponse.json(
        {
          error: "file_required"
        },
        {
          status: 400
        }
      );

    }

    const extension =
      file.name.split(".").pop();

    const path =
      `${category}/${crypto.randomUUID()}.${extension}`;

    const bytes =
      Buffer.from(
        await file.arrayBuffer()
      );

    const upload =
      await supabase.storage
        .from("partner-resources")
        .upload(
          path,
          bytes,
          {
            contentType: file.type,
            upsert: false
          }
        );

    if (upload.error) {

      throw upload.error;

    }

    const { error: insertError } =
      await supabase
        .schema("raffles")
        .from("partner_resources")
        .insert({

          title,

          description,

          category,

          storage_path: path,

          file_name: file.name,

          mime_type: file.type,

          file_size: file.size,

          sort_order: sortOrder,

          created_by: auth.user.id

        });

    if (insertError) {

      throw insertError;

    }

    return NextResponse.json({

      ok: true

    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "server_error"
      },
      {
        status: 500
      }
    );

  }
}
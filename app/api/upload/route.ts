import { createClient } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const formData = await req.formData();

  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string;

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ url: data.path });
}
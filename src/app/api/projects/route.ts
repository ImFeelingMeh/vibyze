import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateUrl } from "@/lib/scanner/urlGuard";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
  return NextResponse.json({ projects: data ?? [] });
}

const postSchema = z.object({
  url: z.string(),
  name: z.string().trim().max(100).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const guard = validateUrl(parsed.data.url);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }

  const url = guard.url;
  const name = parsed.data.name || new URL(url).hostname.replace(/^www\./, "");

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, url })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create project." }, { status: 500 });
  }
  return NextResponse.json({ project: data }, { status: 201 });
}

/**
 * PATCH/DELETE /api/projects/[projectId] — rename or delete a single project.
 * RLS on the projects table already scopes rows to the owner; the explicit
 * user_id filter here is defense-in-depth against a future RLS regression.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Could not rename project." }, { status: 404 });
  }
  return NextResponse.json({ project: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Cascades to the project's scans and issues via the schema's ON DELETE CASCADE.
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Could not delete project." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

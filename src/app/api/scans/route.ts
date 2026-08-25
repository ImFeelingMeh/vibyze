/**
 * POST /api/scans
 * Creates a new project (if needed) and queues a scan.
 *
 * Body: { url: string; projectName: string }
 * Returns: { scanId: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateUrl } from "@/lib/scanner/urlGuard";
import { runScan } from "@/lib/scanner/scanRunner";

const bodySchema = z.object({
  url: z.string(),
  projectName: z.string().trim().max(100).optional(),
});

export async function POST(request: Request) {
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const guard = validateUrl(parsed.data.url);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }

  const url = guard.url;
  const name = parsed.data.projectName || new URL(url).hostname.replace(/^www\./, "");

  // Reuse an existing project with the same URL for this user, else create one.
  let projectId: string;
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("url", url)
    .maybeSingle();

  if (existing) {
    projectId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, url })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json({ error: "Could not create project." }, { status: 500 });
    }
    projectId = created.id;
  }

  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({ project_id: projectId, status: "queued" })
    .select("id")
    .single();

  if (scanError || !scan) {
    return NextResponse.json({ error: "Could not queue the scan." }, { status: 500 });
  }

  // Fire-and-forget: the scan page polls status via the DB.
  void runScan(scan.id, projectId, url);

  return NextResponse.json({ scanId: scan.id }, { status: 201 });
}

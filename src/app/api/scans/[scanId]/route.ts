/**
 * GET /api/scans/[scanId] — fetch a single scan for the authenticated user.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .maybeSingle();

  // RLS ensures only owners can read; empty result means not found/not owned.
  if (error || !scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }
  return NextResponse.json({ scan });
}

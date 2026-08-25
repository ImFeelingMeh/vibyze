/**
 * POST /api/scans
 * Creates a new project (if needed) and queues a scan.
 *
 * Body: { url: string; projectName: string }
 * Returns: { scanId: string }
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, projectName } = body as { url?: string; projectName?: string };

  if (!url || !projectName) {
    return NextResponse.json(
      { error: "url and projectName are required." },
      { status: 400 }
    );
  }

  // TODO: Authenticate the user with NextAuth getServerSession()
  // TODO: Create / find a Project record in the database
  // TODO: Create a Scan record with status PENDING
  // TODO: Enqueue the scan job (e.g. via a background queue)

  // Placeholder response — replace with real DB logic
  const scanId = "placeholder-scan-id";
  return NextResponse.json({ scanId }, { status: 201 });
}

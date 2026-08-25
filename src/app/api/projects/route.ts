/**
 * GET  /api/projects  — list all projects for the authenticated user.
 * POST /api/projects  — create a new project.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Authenticate the user with NextAuth getServerSession()
  // TODO: Fetch all projects from the database for the current user

  // Placeholder response
  return NextResponse.json({ projects: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, url } = body as { name?: string; url?: string };

  if (!name || !url) {
    return NextResponse.json(
      { error: "name and url are required." },
      { status: 400 }
    );
  }

  // TODO: Authenticate the user with NextAuth getServerSession()
  // TODO: Insert a new Project record in the database

  // Placeholder response
  return NextResponse.json({ project: { id: "placeholder", name, url } }, { status: 201 });
}

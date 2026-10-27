import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function GET() {
  await getDb();
  const resolutions = prepare("SELECT * FROM resolutions ORDER BY created_at DESC").all();
  return NextResponse.json(resolutions);
}

export async function POST(req: NextRequest) {
  await getDb();
  const body = await req.json();
  const { issue, category, solution, tags } = body;

  if (!issue || !solution) {
    return NextResponse.json({ error: "Issue and solution are required" }, { status: 400 });
  }

  const result = prepare(
    "INSERT INTO resolutions (issue, category, solution, tags) VALUES (?, ?, ?, ?)"
  ).run(issue, category || "General", solution, tags || "[]");

  const resolution = prepare("SELECT * FROM resolutions WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(resolution, { status: 201 });
}
import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function GET() {
  await getDb();
  const tasks = prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    ORDER BY t.due_date ASC
  `).all();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  await getDb();
  const body = await req.json();
  const { title, description, email_id, assignee_id, priority, due_date, status } = body;

  const result = prepare(
    "INSERT INTO tasks (title, description, email_id, assignee_id, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(title, description || "", email_id || null, assignee_id, priority || "Medium", status || "New", due_date || null);

  const task = prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(task, { status: 201 });
}
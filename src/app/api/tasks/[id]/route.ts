import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getDb();

  const task = prepare("SELECT * FROM tasks WHERE id = ?").get(parseInt(id)) as any;
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await req.json();
  const status = body.status ?? task.status;
  const priority = body.priority ?? task.priority;
  const assignee_id = body.assignee_id ?? task.assignee_id;

  prepare(
    "UPDATE tasks SET status = ?, priority = ?, assignee_id = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, priority, assignee_id, task.id);

  const updated = prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.id = ?
  `).get(task.id);

  return NextResponse.json(updated);
}
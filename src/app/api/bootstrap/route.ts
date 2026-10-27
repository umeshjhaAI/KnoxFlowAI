import { NextResponse } from "next/server";
import { getDb, initDb, prepare } from "@/lib/db";
import { seedAll } from "@/lib/seed";

export async function GET() {
  await initDb();
  await seedAll();

  const users = prepare("SELECT * FROM users").all();
  const emails = prepare("SELECT * FROM emails ORDER BY received_at DESC").all();
  const tasks = prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    ORDER BY t.due_date ASC
  `).all();
  const resolutions = prepare("SELECT * FROM resolutions ORDER BY created_at DESC").all();

  const stats = {
    totalEmails: prepare("SELECT COUNT(*) as c FROM emails").get()?.c || 0,
    totalTasks: prepare("SELECT COUNT(*) as c FROM tasks").get()?.c || 0,
    overdueTasks: prepare("SELECT COUNT(*) as c FROM tasks WHERE due_date < date('now') AND status != 'Resolved'").get()?.c || 0,
    activeTasks: prepare("SELECT COUNT(*) as c FROM tasks WHERE status IN ('New','In Progress','Waiting for Client','Waiting Internally')").get()?.c || 0,
    teamSize: prepare("SELECT COUNT(*) as c FROM users").get()?.c || 0,
    onLeave: prepare("SELECT COUNT(*) as c FROM users WHERE on_leave = 1").get()?.c || 0,
  };

  return NextResponse.json({ users, emails, tasks, resolutions, stats });
}
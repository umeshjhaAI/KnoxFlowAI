import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function POST(req: NextRequest) {
  await getDb();
  const body = await req.json();
  const { assignee_id } = body;

  const targetUser = prepare("SELECT * FROM users WHERE id = ?").get(assignee_id) as any;
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Find tasks assigned to this user
  const userTasks = prepare("SELECT * FROM tasks WHERE assignee_id = ? AND status != 'Resolved'").all(assignee_id) as any[];

  // Find replacement candidates: not on leave, not the same user, with overlapping skills
  const targetSkills: string[] = JSON.parse(targetUser.skills || "[]");
  const candidates = prepare("SELECT * FROM users WHERE id != ? AND on_leave = 0").all(assignee_id) as any[];

  const scored = candidates.map((c) => {
    const cSkills: string[] = JSON.parse(c.skills || "[]");
    const overlap = targetSkills.filter((s) => cSkills.includes(s)).length;
    const cTaskCount = (prepare("SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status != 'Resolved'").get(c.id) as any)?.c || 0;
    const score = overlap * 10 - cTaskCount * 2;
    return { ...c, skills: cSkills, activeTasks: cTaskCount, matchScore: score, overlappingSkills: targetSkills.filter((s) => cSkills.includes(s)) };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({
    user: targetUser,
    tasksToReassign: userTasks,
    candidates: scored,
    recommendedCandidate: scored.length > 0 ? scored[0] : null,
    requiresApproval: true,
  });
}
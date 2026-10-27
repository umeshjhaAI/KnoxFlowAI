import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getDb();

  const email = prepare("SELECT * FROM emails WHERE id = ?").get(parseInt(id)) as any;
  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  // Mark as replied with substantive reply
  prepare("UPDATE emails SET has_reply = 1, reply_type = 'substantive' WHERE id = ?").run(email.id);

  return NextResponse.json({
    success: true,
    message: `Reply for thread ${email.thread_id} has been saved locally. NOTE: This reply is stored in the local database only and has NOT been sent to the client. Production Knox Mail integration is out of scope for this prototype.`,
  });
}
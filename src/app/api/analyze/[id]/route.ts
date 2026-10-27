import { NextRequest, NextResponse } from "next/server";
import { getDb, prepare } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getDb();

  const email = prepare("SELECT * FROM emails WHERE id = ?").get(parseInt(id)) as any;
  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  // If already has substantive reply, refuse to generate duplicate
  if (email.has_reply && email.reply_type === "substantive") {
    return NextResponse.json({
      duplicate: true,
      message: "This email already has a substantive reply. No duplicate draft will be generated.",
      existingReply: email.reply_draft || "",
    });
  }

  // Find relevant historical resolutions
  const resolutions = prepare(
    "SELECT * FROM resolutions WHERE category LIKE ? OR tags LIKE ? OR issue LIKE ? LIMIT 5"
  ).all(
    `%${email.category}%`,
    `%${email.category.toLowerCase().replace(/\s+/g, "-")}%`,
    `%${email.category.split(" ")[0]}%`
  ) as any[];

  // Build draft using historical data (rule-based AI fallback)
  let draft: string;

  if (resolutions.length > 0) {
    const best = resolutions[0];
    const consultantName = "Knox Consulting Team";

    draft = `Dear ${email.client_name},

Thank you for reaching out regarding "${email.subject}".

Based on our experience with similar situations, here is our approach:

${best.solution.split(".").slice(0, 2).join(".\n")}

We've handled this type of issue before for clients in ${email.category.toLowerCase()} and can apply the same proven methodology to your case.

Next steps:
- We will assign a consultant to review your specific details within 24 hours
- A detailed action plan will be shared with you
- We'll schedule a call to walk through the resolution timeline

Please let us know if you need any additional information in the meantime.

Best regards,
${consultantName}`;
  } else {
    draft = `Dear ${email.client_name},

Thank you for your email regarding "${email.subject}".

We have received your request and a member of our team will review it promptly. We aim to provide you with a detailed response within 24 hours.

If you have any urgent additional information to share, please don't hesitate to let us know.

Best regards,
Knox Consulting Team`;
  }

  // Save draft
  prepare("UPDATE emails SET reply_draft = ? WHERE id = ?").run(draft, email.id);

  return NextResponse.json({
    duplicate: false,
    draft,
    relevantResolutions: resolutions,
    confidence: resolutions.length > 0 ? "high" : "medium",
    fallback: true,
    fallbackNote: "Using rule-based AI fallback (no external AI API configured).",
  });
}
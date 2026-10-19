import { apiSession } from "@/lib/auth";

const BOARDS = ["IGCSE (Edexcel)", "IGCSE (Cambridge)", "GCSE (AQA)", "GCSE (Edexcel)", "GCSE (OCR)"];
const TIERS = ["Higher", "Foundation", "Extended", "Core"];

// Tutor invites a student or a parent. Supabase emails them a link to set a password.
export async function POST(request) {
  const s = await apiSession(["tutor"]);
  if (s.error) return s.error;
  const { admin } = s;

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }

  const role = body.role === "parent" ? "parent" : "student";
  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.firstName || "").trim().replace(/\s+/g, " ").slice(0, 30);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!firstName) return Response.json({ error: "Enter a first name." }, { status: 400 });

  let studentIds = [];
  if (role === "student") {
    if (!body.consent) return Response.json({ error: "Confirm that a parent or guardian has agreed before inviting a student." }, { status: 400 });
    if (!BOARDS.includes(body.board) || !TIERS.includes(body.tier)) return Response.json({ error: "Pick an exam board and tier." }, { status: 400 });
  } else {
    studentIds = Array.isArray(body.studentIds) ? body.studentIds.map(String) : [];
    if (!studentIds.length) return Response.json({ error: "Pick at least one child for this parent." }, { status: 400 });
    const { data: found } = await admin.from("profiles").select("id").in("id", studentIds).eq("role", "student");
    if ((found || []).length !== studentIds.length) return Response.json({ error: "One of those students wasn't found." }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${site}/auth/confirm`,
    data: { first_name: firstName },
  });
  if (error) {
    const exists = /already|registered|exists/i.test(error.message);
    return Response.json({ error: exists ? "That email already has an account." : `The invite couldn't be sent: ${error.message}` }, { status: 400 });
  }

  const id = invited.user.id;
  const profile = role === "student"
    ? { id, role, first_name: firstName, board: body.board, tier: body.tier, consent_recorded_at: new Date().toISOString() }
    : { id, role, first_name: firstName };

  const { error: pErr } = await admin.from("profiles").insert(profile);
  if (pErr) {
    await admin.auth.admin.deleteUser(id);
    return Response.json({ error: "Couldn't save the profile. Try again." }, { status: 500 });
  }
  if (role === "student") {
    await admin.from("progress").insert({ student_id: id });
  } else {
    await admin.from("parent_links").insert(studentIds.map(sid => ({ parent_id: id, student_id: sid })));
  }

  return Response.json({ ok: true, message: `Invite sent to ${email}.` });
}

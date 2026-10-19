import { apiSession } from "@/lib/auth";

// Tutor links an existing parent to another child (e.g. a sibling).
export async function POST(request) {
  const s = await apiSession(["tutor"]);
  if (s.error) return s.error;
  const { admin } = s;
  const { parentId, studentId } = await request.json().catch(() => ({}));
  if (!parentId || !studentId) return Response.json({ error: "Pick a parent and a student." }, { status: 400 });

  const { data: people } = await admin.from("profiles").select("id, role").in("id", [parentId, studentId]);
  const ok = (people || []).some(p => p.id === parentId && p.role === "parent") && (people || []).some(p => p.id === studentId && p.role === "student");
  if (!ok) return Response.json({ error: "That parent or student wasn't found." }, { status: 400 });

  const { error } = await admin.from("parent_links").upsert({ parent_id: parentId, student_id: studentId });
  if (error) return Response.json({ error: "Couldn't link them. Try again." }, { status: 500 });
  return Response.json({ ok: true });
}

// Who is logged in, and what are they allowed to see. SERVER ONLY.
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const admin = createAdminClient();
  let { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();

  // The first time the tutor (TUTOR_EMAIL) signs in, make their tutor profile.
  const tutorEmail = (process.env.TUTOR_EMAIL || "").trim().toLowerCase();
  if (!profile && tutorEmail && user.email?.toLowerCase() === tutorEmail) {
    const { data } = await admin
      .from("profiles")
      .insert({ id: user.id, role: "tutor", first_name: process.env.TUTOR_NAME || "Tutor" })
      .select()
      .single();
    profile = data;
  }
  return { user, profile, admin };
}

// For pages: sends people elsewhere if they shouldn't be here.
export async function requireRole(role) {
  const s = await getSession();
  if (!s.user) redirect("/login");
  if (!s.profile) redirect("/home");
  if (role && s.profile.role !== role) redirect("/home");
  return s;
}

// For API routes: returns { error } as a Response, or the session.
export async function apiSession(roles) {
  const s = await getSession();
  if (!s.user || !s.profile) return { error: Response.json({ error: "Please log in again." }, { status: 401 }) };
  if (roles && !roles.includes(s.profile.role)) return { error: Response.json({ error: "Not allowed." }, { status: 403 }) };
  return s;
}

// Can this person see this student's data?
export async function canSeeStudent(admin, profile, studentId) {
  if (profile.role === "tutor") return true;
  if (profile.role === "student") return profile.id === studentId;
  if (profile.role === "parent") {
    const { data } = await admin.from("parent_links").select("student_id").eq("parent_id", profile.id).eq("student_id", studentId).maybeSingle();
    return !!data;
  }
  return false;
}

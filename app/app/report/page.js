import { requireRole } from "@/lib/auth";
import Report from "@/components/Report";

export const dynamic = "force-dynamic";
export const metadata = { title: "My report" };

export default async function StudentReport() {
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("*").eq("student_id", profile.id).maybeSingle();
  return <Report student={profile} progress={data} />;
}

import { requireRole } from "@/lib/auth";
import { maxGradeFor } from "@/lib/topics";
import GradeCheck from "@/components/GradeCheck";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grade Check" };

export default async function CheckPage() {
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("placement").eq("student_id", profile.id).maybeSingle();
  const top = maxGradeFor(profile.tier);
  return <GradeCheck name={profile.first_name} top={top} firstGrade={top <= 5 ? 2 : 3} previous={data?.placement?.grade || null} />;
}

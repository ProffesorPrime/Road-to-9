import { requireRole } from "@/lib/auth";
import Arcade from "@/components/Arcade";

export const dynamic = "force-dynamic";
export const metadata = { title: "Arcade" };

export default async function ArcadePage() {
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("arcade_best").eq("student_id", profile.id).maybeSingle();
  return <Arcade best={data?.arcade_best || 0} name={profile.first_name} />;
}

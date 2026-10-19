import { requireRole } from "@/lib/auth";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function TutorLayout({ children }) {
  const { profile } = await requireRole("tutor");
  return (
    <>
      <Header name={profile.first_name} roleLabel="Tutor" links={[{ href: "/tutor", label: "Students", match: "/tutor" }]} />
      <main className="wrap page">{children}</main>
    </>
  );
}

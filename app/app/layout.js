import Header from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { yesterdayString, dayString } from "@/lib/progress";
import { nextTopic } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }) {
  const { profile, admin } = await requireRole("student");
  const { data: progress } = await admin.from("progress").select("*").eq("student_id", profile.id).maybeSingle();
  const p = progress || {};
  const live = p.last_day === dayString() || p.last_day === yesterdayString();
  const nx = nextTopic(p, profile.tier);

  return (
    <>
      <Header
        name={profile.first_name}
        xp={p.xp || 0}
        streak={live ? p.day_streak || 0 : 0}
        links={[
          { href: "/app", label: "Map" },
          { href: `/app/practice/${nx.id}`, label: "Practice", match: "/app/practice" },
          { href: "/app/report", label: "Report" },
        ]}
      />
      <main className="wrap page">{children}</main>
    </>
  );
}

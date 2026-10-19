import { requireRole } from "@/lib/auth";
import Header from "@/components/Header";
import Report from "@/components/Report";
import { ago } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parent view" };

export default async function ParentPage({ searchParams }) {
  const sp = await searchParams;
  const { profile, admin } = await requireRole("parent");
  const { data: links } = await admin.from("parent_links").select("student_id").eq("parent_id", profile.id);
  const ids = (links || []).map(l => l.student_id);
  const { data: kids } = ids.length
    ? await admin.from("profiles").select("*").in("id", ids).order("first_name")
    : { data: [] };

  const child = (kids || []).find(k => k.id === sp?.child) || (kids || [])[0];
  let progress = null, last = null;
  if (child) {
    const [{ data: p }, { data: a }] = await Promise.all([
      admin.from("progress").select("*").eq("student_id", child.id).maybeSingle(),
      admin.from("attempts").select("created_at").eq("student_id", child.id).order("created_at", { ascending: false }).limit(1),
    ]);
    progress = p;
    last = a?.[0]?.created_at;
  }

  return (
    <>
      <Header name={profile.first_name} roleLabel="Parent" links={[{ href: "/parent", label: "My child" }]} />
      <main className="wrap page">
        {!child ? (
          <div className="card panel">
            <h1 style={{ fontSize: "1.3rem" }}>No students linked yet</h1>
            <p>Your tutor hasn't linked a child to your account. Get in touch with them and they'll sort it out.</p>
          </div>
        ) : (
          <>
            {(kids || []).length > 1 && (
              <div className="seg" style={{ marginBottom: 18 }}>
                {kids.map(k => (
                  <a key={k.id} href={`/parent?child=${k.id}`} className="btn sm" style={k.id === child.id ? undefined : { background: "transparent", color: "var(--muted)" }}>{k.first_name}</a>
                ))}
              </div>
            )}
            <Report
              student={child}
              progress={progress}
              lastActive={ago(last)}
              noteFor={{ live: !!process.env.ANTHROPIC_API_KEY, audience: "parent" }}
            />
          </>
        )}
      </main>
    </>
  );
}

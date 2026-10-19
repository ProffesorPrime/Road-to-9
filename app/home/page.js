import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sign } from "@/components/Bits";

export const dynamic = "force-dynamic";

// Sends each person to the right place after logging in.
export default async function Home() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  if (profile?.role === "tutor") redirect("/tutor");
  if (profile?.role === "parent") redirect("/parent");
  if (profile?.role === "student") redirect("/app");

  return (
    <main className="auth wrap">
      <div className="card auth-card">
        <a className="auth-brand" href="/"><Sign>9</Sign><span>Road to 9</span></a>
        <h1 style={{ fontSize: "1.3rem" }}>Your account isn't set up yet</h1>
        <p>You're logged in as {user.email}, but there's no student, parent or tutor profile for this email. Ask your tutor to send you an invite.</p>
        <form action="/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form>
      </div>
    </main>
  );
}

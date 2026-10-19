import { Sign } from "@/components/Bits";

export default function NotFound() {
  return (
    <main className="auth wrap">
      <div className="card auth-card" style={{ textAlign: "center", justifyItems: "center" }}>
        <Sign size={72}>?</Sign>
        <h1 style={{ fontSize: "1.4rem" }}>Wrong turn</h1>
        <p>This page isn't on the road. Head back and try again.</p>
        <a className="btn" href="/home">Back to my road</a>
      </div>
    </main>
  );
}

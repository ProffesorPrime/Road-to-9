import { SITE } from "@/lib/site";
import { TOPICS } from "@/lib/topics";
import { PrimeFace, Sign, Brand } from "@/components/Bits";

export default function Landing() {
  const wa = SITE.whatsapp.replace(/[^\d]/g, "");
  const ig = SITE.instagram.replace(/^@/, "");
  return (
    <>
      <div className="wrap land-nav">
        <Brand />
        <a className="btn ghost sm" href="/login">Student & parent login</a>
      </div>

      <section className="wrap land-hero">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <Sign size={84}>9</Sign>
            <h1>Road to 9</h1>
          </div>
          <p className="lede">IGCSE and GCSE maths tutoring that keeps going between lessons. Live sessions with {SITE.tutorName}, plus daily practice with Professor Prime.</p>
          <div className="hero-ctas">
            <a className="btn" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">Book a free trial on WhatsApp</a>
            <a className="btn ghost" href="#how">How it works</a>
          </div>
          <p className="small" style={{ marginTop: 14 }}>{SITE.location}</p>
        </div>
        <div className="card hero-card">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <PrimeFace />
            <p className="bubble">Greetings! I'm Professor Prime. I won't give you the answer, but I'll help you find it. Every time.</p>
          </div>
          <div className="label">The road</div>
          <div className="chips">
            {TOPICS.slice(0, 7).map(t => <span key={t.id} className="chip">{t.name}</span>)}
            <span className="chip">+ more</span>
          </div>
        </div>
      </section>

      <section id="how" className="wrap land-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="card"><b>Live lessons</b><h3>Learn with your tutor</h3><p className="small">One-to-one or small-group online lessons, planned around your exam board and the topics you find hardest.</p></div>
          <div className="card"><b>Every day</b><h3>Practise with Prime</h3><p className="small">Fresh questions on every topic. Earn XP, keep your streak and clear each stop. Professor Prime gives hints when you're stuck.</p></div>
          <div className="card"><b>Every week</b><h3>Parents see progress</h3><p className="small">Parents get their own login with a clear report: working grade, strong topics and what to focus on next.</p></div>
        </div>
      </section>

      <section className="wrap land-section">
        <h2>About {SITE.tutorName}</h2>
        <div className="card panel" style={{ maxWidth: 760 }}>
          <p>{SITE.tutorBio}</p>
          <div className="chips">{SITE.boards.map(b => <span key={b} className="chip">{b}</span>)}</div>
        </div>
      </section>

      <section className="wrap land-section">
        <h2>Get in touch</h2>
        <div className="contact">
          <div className="card"><span className="label">WhatsApp</span><strong>{SITE.whatsapp}</strong><a className="small" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">Message me</a></div>
          <div className="card"><span className="label">Email</span><strong>{SITE.email}</strong><a className="small" href={`mailto:${SITE.email}`}>Send an email</a></div>
          <div className="card"><span className="label">Instagram</span><strong>{SITE.instagram}</strong><a className="small" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">Follow for maths tips</a></div>
        </div>
      </section>

      <footer className="wrap foot">
        <span>© {new Date().getFullYear()} {SITE.brand}</span>
        <span><a href="/privacy">Privacy</a> · <a href="/login">Log in</a></span>
      </footer>
    </>
  );
}

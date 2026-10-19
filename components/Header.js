import { Brand } from "./Bits";
import Nav from "./Nav";

function Streak({ days }) {
  return (
    <div className="stat" title="Daily streak">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="var(--prime)" /></svg>
      <span>{days} day{days === 1 ? "" : "s"}</span>
    </div>
  );
}

// The bar across the top of every logged-in page.
export default function Header({ name, links, xp, streak, roleLabel }) {
  const showStats = typeof xp === "number";
  const level = showStats ? Math.floor(xp / 100) + 1 : 0;
  return (
    <header className="top">
      <div className="wrap top-inner">
        <Brand href="/home" />
        <Nav links={links} />
        <div className="stats">
          {showStats && <Streak days={streak} />}
          {showStats && (
            <div className="xp" id="xp-box">
              <div className="stat"><span>Level {level}</span><span className="small">{xp} XP</span></div>
              <div className="xpbar"><i style={{ width: `${xp % 100}%` }} /></div>
            </div>
          )}
          <div className="who">
            <span className="who-name">{name}{roleLabel ? ` · ${roleLabel}` : ""}</span>
            <form action="/logout" method="post"><button className="link" type="submit">Log out</button></form>
          </div>
        </div>
      </div>
    </header>
  );
}

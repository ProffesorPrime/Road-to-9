"use client";
import { usePathname } from "next/navigation";

// Tab links that highlight the current section.
export default function Nav({ links }) {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Sections">
      {links.map(l => {
        const active = l.match ? path.startsWith(l.match) : path === l.href;
        return (
          <a key={l.href} href={l.href} aria-current={active ? "page" : undefined}>{l.label}</a>
        );
      })}
    </nav>
  );
}

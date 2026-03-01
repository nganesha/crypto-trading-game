// components/Sidebar.jsx
// Navigation sidebar — add new links here as you build more pages.
// Uses Next.js usePathname to highlight the active route.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { section: "Markets" },
  {
    href: "/",
    label: "Prices",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  { section: "Trading" },
  {
    href: "/trade",
    label: "Trade",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  // ── Add future pages below ────────────────────────────────────────────────
  // { href: "/portfolio", label: "Portfolio", icon: <...> },
  // { href: "/settings",  label: "Settings",  icon: <...> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-mark">₿</span>
        <span className="logo-text">CryptoView</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) =>
          item.section ? (
            <p
              key={item.section}
              className="nav-section-label"
              style={i > 0 ? { marginTop: "1.2rem" } : {}}
            >
              {item.section}
            </p>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {pathname === item.href && <span className="nav-active-bar" />}
            </Link>
          )
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-version">v0.3.0</span>
        <span className="sidebar-source">CoinGecko API</span>
      </div>
    </aside>
  );
}
// components/Sidebar.jsx
// Navigation sidebar — add new links here as you build more pages.
// Uses Next.js usePathname to highlight the active route.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
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
  // ── Add future pages below ────────────────────────────────────────────────
  // { href: "/portfolio", label: "Portfolio", icon: <...> },
  // { href: "/alerts",    label: "Alerts",    icon: <...> },
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
        <p className="nav-section-label">Markets</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {pathname === item.href && <span className="nav-active-bar" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-version">v0.2.0</span>
        <span className="sidebar-source">CoinGecko API</span>
      </div>
    </aside>
  );
}
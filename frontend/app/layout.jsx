// app/layout.jsx
// Root layout — sidebar shell wraps every page.
// Add new pages/links inside Sidebar.jsx as you build more features.

import { Syne, IBM_Plex_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "CryptoView",
  description: "Live crypto price dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
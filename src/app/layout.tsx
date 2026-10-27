"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/inbox", label: "Inbox", icon: "📥" },
  { href: "/tasks", label: "My Tasks", icon: "📋" },
  { href: "/team", label: "Team Overview", icon: "👥" },
  { href: "/resolutions", label: "Resolution Log", icon: "📚" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "w-64" : "w-0"
            } bg-[#0f172a] text-white flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col`}
          >
            <div className="p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  KF
                </div>
                <div>
                  <div className="font-semibold text-sm tracking-tight">KnoxFlow AI</div>
                  <div className="text-[10px] text-slate-400 font-medium">Consulting Operations</div>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Demo Mode</div>
              <div className="text-xs text-slate-400">Local SQLite · Rule-Based AI</div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  JW
                </div>
              </div>
            </header>

            {/* Page content */}
            <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
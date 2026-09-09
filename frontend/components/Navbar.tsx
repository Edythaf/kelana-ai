"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function linkStyle(path: string) {
    const active =
      path === "/trips"
        ? pathname.startsWith("/trips")
        : pathname === path;

    return active
      ? "text-blue-600"
      : "text-slate-600 transition hover:text-slate-900";
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* BRAND */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            ✈
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight">
              KelanaAI
            </p>

            <p className="text-xs text-slate-500">
              AI Travel Planner
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={linkStyle("/")}
          >
            Plan Trip
          </Link>

          <Link
            href="/trips"
            className={linkStyle("/trips")}
          >
            My Trips
          </Link>

          <Link
            href="/chat"
            className={linkStyle("/chat")}
          >
            AI Chat
          </Link>

          <Link
            href="/assistant"
            className={linkStyle("/assistant")}
          >
            Travel Assistant
          </Link>

          <Link
            href="/profile"
            className={linkStyle("/profile")}
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
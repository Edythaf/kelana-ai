"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTrips } from "@/services/tripService";
import { TripList } from "@/components/TripList";

export function TripsClient() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    getTrips(token)
      .then((data) => {
        if (Array.isArray(data)) {
          setTrips(data);
        } else {
          console.error("Failed to load trips:", data);
          setTrips([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load trips:", error);
        setTrips([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-slate-600 transition hover:text-slate-900"
            >
              Plan Trip
            </Link>

            <Link
              href="/trips"
              className="text-blue-600"
            >
              My Trips
            </Link>

            <Link
              href="/chat"
              className="text-slate-600 transition hover:text-slate-900"
            >
              AI Chat
            </Link>

            <Link
              href="/profile"
              className="text-slate-600 transition hover:text-slate-900"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Your journeys
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                My Trips
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Review your previous adventures and revisit
                itineraries created with KelanaAI.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Plan New Trip
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-semibold">
              Loading your trips...
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Getting your saved journeys from KelanaAI.
            </p>
          </div>
        ) : (
          <TripList trips={trips} />
        )}
      </section>
    </main>
  );
}
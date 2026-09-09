"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getTrip } from "@/services/tripService";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const tripId = Number(params.id);

    getTrip(tripId, token)
      .then((data) => {
        setTrip(data);
      })
      .catch((error) => {
        console.error("Failed to load trip:", error);
        setError("We couldn't load this trip.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold">
              Loading your trip...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Getting your itinerary from KelanaAI.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-4xl">✈️</div>

            <h1 className="mt-4 text-2xl font-bold">
              Trip not found
            </h1>

            <p className="mt-2 text-slate-500">
              {error || "This trip is no longer available."}
            </p>

            <Link
              href="/trips"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to My Trips
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* PAGE */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          ← Back to My Trips
        </Link>

        {/* HERO CARD */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-lg sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Your KelanaAI Journey
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {trip.destination}
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            A personalized itinerary created for your travel preferences.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {trip.category && (
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                {trip.category}
              </span>
            )}

            {trip.travel_style && (
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                {trip.travel_style}
              </span>
            )}
          </div>
        </div>

        {/* TRIP SUMMARY */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Duration
            </p>

            <p className="mt-2 text-2xl font-bold">
              {trip.days} days
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Budget
            </p>

            <p className="mt-2 text-2xl font-bold">
              USD {Number(trip.budget).toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Daily Budget
            </p>

            <p className="mt-2 text-2xl font-bold">
              USD{" "}
              {Number(
                trip.daily_budget ?? trip.budget / trip.days
              ).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* AI ITINERARY */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                AI Recommendation
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your personalized itinerary
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 px-3 py-2 text-xl">
              ✦
            </div>
          </div>

          {trip.ai_recommendation ? (
            <div className="mt-7 whitespace-pre-wrap leading-8 text-slate-700">
              {trip.ai_recommendation}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-slate-50 px-6 py-8 text-center">
              <p className="font-semibold">
                No AI recommendation available yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Generate an itinerary from the Plan Trip page.
              </p>
            </div>
          )}
        </section>

        {/* NEXT ACTIONS */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl">✈️</p>

            <h3 className="mt-4 font-bold">
              Plan another trip
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create a new AI-powered itinerary.
            </p>
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl">◌</p>

            <h3 className="mt-4 font-bold">
              Ask KelanaAI
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Continue planning through AI conversation.
            </p>
          </Link>
        </section>
      </section>
    </main>
  );
}
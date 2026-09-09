"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      const formData = new FormData(event.currentTarget);

      const destination = String(
        formData.get("destination") ?? ""
      );

      const budget = Number(
        formData.get("budget")
      );

      const days = Number(
        formData.get("days")
      );

      const travelStyle = String(
        formData.get("travel_style") ?? ""
      );

      // STEP 1 — Save trip
      const response = await fetch(
        `${API_URL}/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination,
            budget,
            days,
            travel_style: travelStyle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create trip");
      }

      const trip = await response.json();

      // STEP 2 — Generate AI recommendation
      const aiResponse = await fetch(
        `${API_URL}/trips/${trip.id}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!aiResponse.ok) {
        throw new Error(
          "Failed to generate recommendation"
        );
      }

      await aiResponse.json();

      router.push("/trips");
    } catch (error) {
      console.error(
        "Trip generation failed:",
        error
      );

      setError(
        "We couldn't generate your itinerary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            ✦ Powered by Amazon Bedrock
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your next adventure,
            <span className="block text-blue-600">
              planned by AI.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Tell KelanaAI where you want to go,
            your budget, and your travel style.
            We&apos;ll create a personalized
            itinerary for your journey.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
            <span>✓ Personalized itinerary</span>
            <span>✓ AI recommendations</span>
            <span>✓ Saved trip history</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/japan.jpg"
            alt="Travel destination in Japan"
            width={1200}
            height={800}
            priority
            className="h-[420px] w-full object-cover"
          />

          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-5 py-4 shadow-lg backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Featured Destination
            </p>

            <p className="mt-1 text-lg font-semibold">
              Japan
            </p>

            <p className="text-sm text-slate-600">
              Culture · Food · Nature
            </p>
          </div>
        </div>
      </section>

      {/* TRIP FORM */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Start Planning
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Create your AI itinerary
            </h2>

            <p className="mt-2 text-slate-600">
              Fill in your travel preferences and
              let KelanaAI do the planning.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Destination
              </label>

              <input
                type="text"
                name="destination"
                placeholder="Japan"
                required
                className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Travel Style
              </label>

              <input
                type="text"
                name="travel_style"
                placeholder="Family, Adventure, Luxury..."
                required
                className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Budget
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  name="budget"
                  placeholder="2000"
                  required
                  min="1"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Duration
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="days"
                  placeholder="5"
                  required
                  min="1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  days
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Generating your itinerary..."
                  : "Generate AI Itinerary ✦"}
              </button>
            </div>

            {loading && (
              <div className="md:col-span-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                KelanaAI is creating your
                personalized itinerary with Amazon
                Bedrock...
              </div>
            )}

            {error && (
              <div className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <div className="text-2xl">
              ✦
            </div>

            <h3 className="mt-4 font-semibold">
              AI-powered planning
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Generate personalized travel
              recommendations using Amazon Bedrock.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <div className="text-2xl">
              ▦
            </div>

            <h3 className="mt-4 font-semibold">
              Save your journeys
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep your previous trips organized and
              access them anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <div className="text-2xl">
              ◌
            </div>

            <h3 className="mt-4 font-semibold">
              Continue the conversation
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chat with KelanaAI while conversation
              context stays available.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <p>
            © 2026 KelanaAI. AI-powered travel
            planning.
          </p>

          <div className="flex gap-5">
            <span>Python</span>
            <span>Next.js</span>
            <span>Amazon Bedrock</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
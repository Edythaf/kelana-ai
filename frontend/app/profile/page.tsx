"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

type Profile = {
  id: number;
  name: string;
  email: string;
  total_trips: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        setError("API configuration is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load profile"
          );
        }

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        setError(
          "We couldn't load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const initials =
    profile?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "K";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Your Account
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            View your KelanaAI account information and
            travel activity.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              ◌
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Loading your profile...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Getting your KelanaAI account details.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="text-3xl">
              ⚠
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Unable to load profile
            </h2>

            <p className="mt-2 text-slate-500">
              {error}
            </p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* PROFILE CARD */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 text-white sm:px-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
                    {initials}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      KelanaAI Member
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                      {profile.name}
                    </h2>

                    <p className="mt-2 text-blue-100">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-slate-200 p-8 md:border-b-0 md:border-r">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Account Information
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="text-sm text-slate-500">
                        Full Name
                      </p>

                      <p className="mt-1 font-semibold">
                        {profile.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Email Address
                      </p>

                      <p className="mt-1 font-semibold">
                        {profile.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        User ID
                      </p>

                      <p className="mt-1 font-semibold">
                        #{profile.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Travel Activity
                  </p>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-6">
                    <p className="text-sm text-slate-500">
                      Trips Generated
                    </p>

                    <p className="mt-2 text-4xl font-bold text-blue-600">
                      {profile.total_trips}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      AI-powered itineraries saved to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Quick Actions
              </p>

              <div className="grid gap-5 md:grid-cols-3">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="text-2xl">
                    ✈️
                  </div>

                  <h3 className="mt-4 font-bold">
                    Plan a Trip
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a new AI-powered itinerary.
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push("/trips")
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="text-2xl">
                    ▦
                  </div>

                  <h3 className="mt-4 font-bold">
                    My Trips
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review your saved travel plans.
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push("/chat")
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="text-2xl">
                    ◌
                  </div>

                  <h3 className="mt-4 font-bold">
                    AI Chat
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Continue a conversation with KelanaAI.
                  </p>
                </button>
              </div>
            </div>

            {/* SECURITY */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  ✓
                </div>

                <div>
                  <h3 className="font-semibold">
                    Your account is protected
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    KelanaAI uses secure authentication,
                    hashed passwords, and JWT-based access
                    to protect account data.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured"
        );
      }

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create account"
        );
      }

      router.push("/login");
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <section className="hidden bg-gradient-to-br from-blue-600 to-blue-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur">
              ✈
            </div>

            <div>
              <p className="text-xl font-bold">
                KelanaAI
              </p>

              <p className="text-xs text-blue-100">
                AI Travel Planner
              </p>
            </div>
          </Link>

          <div className="max-w-lg">
            <div className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              ✦ Powered by Amazon Bedrock
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Start exploring.
              <span className="block text-blue-200">
                Plan with AI.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
              Create your KelanaAI account and start
              building personalized travel plans powered
              by AI.
            </p>

            <div className="mt-10 space-y-4 text-sm text-blue-100">
              <p>✓ Personalized AI itineraries</p>
              <p>✓ Saved trip history</p>
              <p>✓ Multi-turn AI conversations</p>
            </div>
          </div>

          <p className="text-sm text-blue-200">
            © 2026 KelanaAI
          </p>
        </section>

        {/* REGISTER FORM */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* MOBILE BRAND */}
            <Link
              href="/"
              className="mb-10 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                ✈
              </div>

              <div>
                <p className="text-xl font-bold">
                  KelanaAI
                </p>

                <p className="text-xs text-slate-500">
                  AI Travel Planner
                </p>
              </div>
            </Link>

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Get started
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Create your account
            </h2>

            <p className="mt-3 text-slate-500">
              Join KelanaAI and start planning your
              next adventure.
            </p>

            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 6 characters.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span>Secure Authentication</span>
              <span>•</span>
              <span>Protected Passwords</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
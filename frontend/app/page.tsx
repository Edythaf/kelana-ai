"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setAiRecommendation("");

    try {
      const formData = new FormData(event.currentTarget);

      const destination = formData.get("destination");
      const budget = formData.get("budget");
      const days = formData.get("days");
      const travelStyle = formData.get("travel_style");

      const response = await fetch(
        "http://localhost:8000/api/v1/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination: destination,
            budget: Number(budget),
            days: Number(days),
            travel_style: travelStyle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create trip");
      }

      const trip = await response.json();

      const aiResponse = await fetch(
        `http://localhost:8000/api/v1/trips/${trip.id}/generate`,
        {
          method: "POST",
        }
      );

      if (!aiResponse.ok) {
        throw new Error("Failed to generate recommendation");
      }

      const recommendation = await aiResponse.json();

      setAiRecommendation(recommendation.recommendation);
      router.push("/trips");
    } catch {
      setError("Unable to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
   <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">
        KelanaAI
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Plan your next adventure
      </p>

      <div className="mt-8 w-full max-w-xl overflow-hidden rounded-2xl">
        
        <Image
          src="/japan.jpg"
          alt="Travel destination in Japan"
          width={1200}
          height={600}
          className="h-64 w-full object-cover"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-xl space-y-5 rounded-2xl bg-white p-4 shadow-lg sm:p-6"
      >
        <div className="flex flex-col gap-2">  
          <label className="font-medium">Destination</label>
          <input
            type="text"
            name="destination"
            placeholder="e.g. Japan"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Budget</label>
          <input
            type="number"
            name="budget"
            placeholder="e.g. 2000"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Days</label>
          <input
            type="number"
            name="days"
            placeholder="e.g. 5"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Travel Style</label>
          <input
            type="text"
            name="travel_style"
            placeholder="e.g. Family"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Generate AI trip
        </button>

        {loading && (
          <p>Generating itinerary... Amazon Bedrock is thinking.</p>
        )}

        {error && (
          <p>{error}</p>
        )}
      </form>

      {aiRecommendation && (
        <section>
          <h2>AI Recommendation</h2>
          <p className="whitespace-pre-wrap">
            {aiRecommendation}
          </p>
        </section>
      )}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
      <p>© 2026 KelanaAI. All rights reserved.</p>

      <div className="mt-2 flex gap-4">
        <a href="#" className="hover:text-slate-900">
          About
        </a>

        <a href="#" className="hover:text-slate-900">
          Privacy
        </a>

        <a href="#" className="hover:text-slate-900">
          Contact
        </a>
      </div>
    </footer>

    </main>
  );
}
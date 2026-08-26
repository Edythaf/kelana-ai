"use client";

import { useState } from "react";

export default function Home() {
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
    } catch {
      setError("Unable to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>KelanaAI</h1>
      <p>Plan your next adventure</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Destination</label>
          <input
            type="text"
            name="destination"
            placeholder="e.g. Japan"
          />
        </div>

        <div>
          <label>Budget</label>
          <input
            type="number"
            name="budget"
            placeholder="e.g. 2000"
          />
        </div>

        <div>
          <label>Days</label>
          <input
            type="number"
            name="days"
            placeholder="e.g. 5"
          />
        </div>

        <div>
          <label>Travel Style</label>
          <input
            type="text"
            name="travel_style"
            placeholder="e.g. Family"
          />
        </div>

        <button type="submit">
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
    </main>
  );
}
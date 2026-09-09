"use client";

import { useState } from "react";
import Link from "next/link";
import { TripCard } from "@/components/TripCard";

export function TripList({ trips }: { trips: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const filteredTrips = trips.filter((trip) =>
    trip.destination
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === "oldest") {
      return a.id - b.id;
    }

    if (sortBy === "budget") {
      return b.budget - a.budget;
    }

    return b.id - a.id;
  });

  return (
    <div>
      {/* SEARCH + SORT */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search destination
            </label>

            <input
              type="text"
              placeholder="Search Japan, Bali, Singapore..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sort trips
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="budget">Highest Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {sortedTrips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="text-4xl">✈️</div>

          <h2 className="mt-4 text-xl font-bold">
            No trips found
          </h2>

          <p className="mt-2 text-slate-500">
            Start planning a new adventure with KelanaAI.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Plan a Trip
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {sortedTrips.length}{" "}
              {sortedTrips.length === 1 ? "trip" : "trips"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
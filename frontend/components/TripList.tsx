"use client";

import { useState } from "react";
import { TripCard } from "@/components/TripCard";

export function TripList({ trips }: { trips: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const filteredTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(search.toLowerCase())
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
      <input
        type="text"
        placeholder="Search trips..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="budget">Highest Budget</option>
      </select>

      {sortedTrips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
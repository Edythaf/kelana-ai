"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrips } from "@/services/tripService";
import { TripList } from "@/components/TripList";

export function TripsClient() {
  const [trips, setTrips] = useState([]);
  const router = useRouter();
  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    getTrips(token).then((data) => {
      setTrips(data);
    });
  }, []);

  return (
  <div>
    <button onClick={handleLogout}>
      Logout
    </button>

    <TripList trips={trips} />
  </div>
);
}
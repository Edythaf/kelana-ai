"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrips } from "@/services/tripService";
import { TripList } from "@/components/TripList";

export function TripsClient() {
  const [trips, setTrips] = useState<any[]>([]);
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
      });
  }, [router]);

  return (
    <div>
      <button onClick={handleLogout}>
        Logout
      </button>

      <TripList trips={trips} />
    </div>
  );
}
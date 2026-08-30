"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    fetch("http://127.0.0.1:8000/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
      });
  }, []);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <main>
      <h1>Profile</h1>

      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Total Trips Generated: {profile.total_trips}</p>
    </main>
  );
}
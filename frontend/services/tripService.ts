const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getTrips(token?: string) {
  const res = await fetch(`${API_URL}/trips`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  })

  return res.json()
}

export async function getTrip(id: number, token?: string) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  })

  if (!res.ok) {
    throw new Error("Failed to load trip")
  }

  return res.json()
}

export async function generateTrip(data: any, token?: string) {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(data),
  })

  return res.json()
}
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

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`)
  return res.json()
}

export async function generateTrip(data: any) {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    body: JSON.stringify(data)
  })

  return res.json()
}
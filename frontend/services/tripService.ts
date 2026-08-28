const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`)
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
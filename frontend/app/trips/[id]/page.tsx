import { getTrip } from "@/services/tripService"

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(Number(id))
  return (
    <div>
        <h1>{trip.destination}</h1>
    </div>
  )
}
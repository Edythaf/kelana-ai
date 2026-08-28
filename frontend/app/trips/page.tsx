import Link from "next/link"
import{getTrips} from "@/services/tripService"
import { TripList } from "@/components/TripList"
export default async function TripsPage() {
    const trips = await getTrips()
    if (trips.length === 0) {
        return (
            <div>
                <h1>Trip History</h1>
                <p>No trips found</p>
                <p>Create your first itinerary.</p>
                
                <Link href="/">
                Generate a Trip →
                </Link>
            </div>
        )
    }
    return (
        <div>
            <TripList trips={trips} />
        </div>
) 
}
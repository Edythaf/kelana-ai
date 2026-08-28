import Link from "next/link"
export function TripCard({trip}: {trip:any}){
    return(
        <div>
            <h3>{trip.destination}</h3>
           
            <p>
                {trip.days} days . USD {trip.budget}
            </p>

            <Link href={`/trips/${trip.id}`}>
              View Details →
            </Link>
        </div>
    )
}
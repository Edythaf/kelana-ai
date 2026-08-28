import Link from "next/link"
const destinationIcons: Record<string, string> = {
  Japan: "🇯🇵",
  Bali: "🌴",
  Singapore: "🇸🇬",
  Thailand: "🇹🇭",
}
const categoryStyles: Record<string, string> = {
  Backpacker: "bg-green-100 text-green-700",
  Standard: "bg-blue-100 text-blue-700",
  Luxury: "bg-purple-100 text-purple-700",
}
export function TripCard({trip}: {trip:any}){
    return(
        <div>
            <h3>
            {destinationIcons[trip.destination] || "✈️"} {trip.destination}
            </h3>
           <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
                categoryStyles[trip.category] || "bg-slate-100 text-slate-700"
            }`}
            >
            {trip.category}
           </span>
           <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {trip.travel_style}
           </span>
            <p>
                {trip.days} days · USD {Number(trip.budget).toLocaleString("en-US")}
            </p>

            <Link href={`/trips/${trip.id}`}>
              View Details →
            </Link>
        </div>
    )
}
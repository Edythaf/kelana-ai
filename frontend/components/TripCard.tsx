import Link from "next/link";

const destinationIcons: Record<string, string> = {
  Japan: "🇯🇵",
  Bali: "🌴",
  Singapore: "🇸🇬",
  Thailand: "🇹🇭",
};

const categoryStyles: Record<string, string> = {
  Backpacker: "bg-green-50 text-green-700",
  Standard: "bg-blue-50 text-blue-700",
  Luxury: "bg-purple-50 text-purple-700",
};

export function TripCard({ trip }: { trip: any }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* DESTINATION */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
            {destinationIcons[trip.destination] || "✈️"}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Destination
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {trip.destination}
            </h3>
          </div>
        </div>
      </div>

      {/* BADGES */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            categoryStyles[trip.category] ||
            "bg-slate-100 text-slate-700"
          }`}
        >
          {trip.category}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {trip.travel_style}
        </span>
      </div>

      {/* TRIP INFO */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Duration
          </p>

          <p className="mt-1 font-semibold">
            {trip.days} days
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Budget
          </p>

          <p className="mt-1 font-semibold">
            USD {Number(trip.budget).toLocaleString("en-US")}
          </p>
        </div>
      </div>

      {/* LINK */}
      <div className="mt-auto pt-6">
        <Link
          href={`/trips/${trip.id}`}
          className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700"
        >
          View Trip Details
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}
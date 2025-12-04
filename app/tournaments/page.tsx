import TournamentListingClient from "@/components/public/TournamentListingClient";

export default function TournamentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Tournaments
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Explore tournament journeys with visual stage progression
        </p>
      </div>

      <TournamentListingClient />
    </div>
  );
}

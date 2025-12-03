import { requireAuth } from "@/lib/auth-utils";
import { ClubsList } from "@/components/ClubsList";
import Link from "next/link";

export default async function ClubsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Sports Clubs
                </h1>
              </div>
              <p className="text-white text-opacity-90 text-sm sm:text-base">
                Manage your clubs, members, and organizational structure
              </p>
            </div>
            <Link href="/dashboard/clubs/new" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Club
              </button>
            </Link>
          </div>
        </div>
      </div>

      <ClubsList />
    </div>
  );
}

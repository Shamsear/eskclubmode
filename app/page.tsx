import Link from "next/link";
import PublicNavigation from "@/components/public/PublicNavigation";
import PublicFooter from "@/components/public/PublicFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Platform - Experience Sports Data Like Never Before",
  description: "Immersive visualizations, real-time statistics, and engaging storytelling. Discover tournaments, players, and clubs.",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <PublicNavigation />
      <main className="flex-1">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
              <div className="text-center animate-fade-in">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Experience Sports Data
                  <br />
                  <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    Like Never Before
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                  Immersive visualizations, real-time statistics, and engaging storytelling.
                  Discover tournaments, players, and clubs through a world-class sports platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/tournaments"
                    className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto text-center"
                  >
                    Explore Tournaments
                  </Link>
                  <Link
                    href="/players"
                    className="px-8 py-4 bg-primary-800/50 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-primary-800/70 transition-all border border-primary-400/30 w-full sm:w-auto text-center"
                  >
                    View Players
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Discover the Platform
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore every aspect of the sports world through innovative data visualization
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Tournaments Card */}
                <Link
                  href="/tournaments"
                  className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-xl transition-all hover:scale-105 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tournaments</h3>
                  <p className="text-gray-600 text-sm">
                    Follow tournament journeys with visual stage progression and live leaderboards
                  </p>
                </Link>

                {/* Matches Card */}
                <Link
                  href="/matches"
                  className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-xl transition-all hover:scale-105 border border-green-100"
                >
                  <div className="w-12 h-12 bg-success-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Matches</h3>
                  <p className="text-gray-600 text-sm">
                    Experience matches through cinematic timelines and detailed player performances
                  </p>
                </Link>

                {/* Players Card */}
                <Link
                  href="/players"
                  className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-xl transition-all hover:scale-105 border border-purple-100"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Players</h3>
                  <p className="text-gray-600 text-sm">
                    Explore player profiles with performance heatmaps and comprehensive statistics
                  </p>
                </Link>

                {/* Clubs Card */}
                <Link
                  href="/clubs"
                  className="group p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:shadow-xl transition-all hover:scale-105 border border-orange-100"
                >
                  <div className="w-12 h-12 bg-warning-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Clubs</h3>
                  <p className="text-gray-600 text-sm">
                    Discover clubs through 3D card interfaces and player constellation networks
                  </p>
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">100+</div>
                  <div className="text-gray-600 font-medium">Tournaments</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-success-600 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">1000+</div>
                  <div className="text-gray-600 font-medium">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-warning-600 mb-2">50+</div>
                  <div className="text-gray-600 font-medium">Clubs</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Ready to Dive In?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Start exploring the world of sports through immersive data visualization
              </p>
              <Link
                href="/tournaments"
                className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

import Link from "next/link";
import PublicNavigation from "@/components/public/PublicNavigation";
import PublicFooter from "@/components/public/PublicFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eskimos Club - eFootball Club Mode Platform",
  description: "Join the Eskimos Club community. Track tournaments, player stats, and club achievements in our eFootball platform.",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E4E5E7]">
      <PublicNavigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Gradient Overlays - Animated */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6600]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB700]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
            <div className="text-center">
              {/* Club Badge/Logo Area */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-[#FF6600] rounded-full flex items-center justify-center border-t-4 border-[#FFB700] group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#FFB700] to-[#FF6600] rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-white block mb-1 sm:mb-2">Welcome to</span>
                <span className="bg-gradient-to-r from-[#FFB700] via-[#FF6600] to-[#FFB700] bg-clip-text text-transparent animate-gradient">
                  Eskimos Club
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-[#E4E5E7] mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
                Your ultimate eFootball club mode platform. Track tournaments, analyze player performance, and dominate the competition.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4 mb-8 sm:mb-10">
                <Link
                  href="/tournaments"
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#FF6600] text-white rounded-lg font-semibold hover:bg-[#CC2900] transition-all text-center text-sm sm:text-base border-t-2 border-[#FFB700] hover:scale-105 active:scale-95 duration-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Tournaments
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/players"
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all border-2 border-[#FFB700] text-center text-sm sm:text-base hover:scale-105 active:scale-95 duration-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    Browse Players
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Quick Stats Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                {[
                  { label: 'Tournaments', value: '100+' },
                  { label: 'Matches', value: '500+' },
                  { label: 'Players', value: '1000+' },
                  { label: 'Clubs', value: '50+' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-[#FFB700]/20 hover:border-[#FFB700]/50 transition-colors">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FFB700] mb-0.5 sm:mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[#E4E5E7]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FFB700]/10 text-[#FF6600] rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                Platform Features
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3 sm:mb-4">
                Explore the Platform
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Everything you need to track and analyze your eFootball club performance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  href: '/tournaments',
                  icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                  title: 'Tournaments',
                  description: 'Track tournament progress with live standings and match schedules'
                },
                {
                  href: '/matches',
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Matches',
                  description: 'View detailed match results and player performance stats'
                },
                {
                  href: '/players',
                  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                  title: 'Players',
                  description: 'Browse player profiles with comprehensive statistics'
                },
                {
                  href: '/clubs',
                  icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                  title: 'Clubs',
                  description: 'Discover clubs and their roster of talented players'
                }
              ].map((feature, idx) => (
                <Link
                  key={idx}
                  href={feature.href}
                  className="group relative p-5 sm:p-6 bg-[#E4E5E7] rounded-xl border-2 border-transparent hover:border-[#FFB700] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFB700]/5 to-[#FF6600]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF6600] rounded-xl flex items-center justify-center mb-3 sm:mb-4 border-t-2 border-[#FFB700] group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#FF6600] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-[#FF6600] text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                      <span>Learn more</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FFB700] to-[#FF6600] bg-clip-text text-transparent mb-2">
                  100+
                </div>
                <div className="text-[#E4E5E7] font-medium text-xs sm:text-sm lg:text-base">Tournaments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6600] to-[#CC2900] bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <div className="text-[#E4E5E7] font-medium text-xs sm:text-sm lg:text-base">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FFB700] to-[#FF6600] bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <div className="text-[#E4E5E7] font-medium text-xs sm:text-sm lg:text-base">Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6600] to-[#FFB700] bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-[#E4E5E7] font-medium text-xs sm:text-sm lg:text-base">Clubs</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-[#FF6600] to-[#CC2900] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB700]/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Join the Community
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Dominate?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Start tracking your eFootball journey with Eskimos Club today and take your game to the next level
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                href="/tournaments"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#FF6600] rounded-lg font-bold hover:bg-[#E4E5E7] transition-all text-sm sm:text-base hover:scale-105 active:scale-95 duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/clubs"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-lg font-semibold hover:bg-white/10 transition-all border-2 border-white text-sm sm:text-base hover:scale-105 active:scale-95 duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Clubs
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

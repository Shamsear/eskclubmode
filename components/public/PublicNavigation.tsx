"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationManager } from "@/lib/navigation/NavigationManager";

export default function PublicNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/tournaments", label: "Tournaments" },
    { href: "/matches", label: "Matches" },
    { href: "/players", label: "Players" },
    { href: "/clubs", label: "Clubs" },
  ];

  const leaderboardLinks = [
    { href: "/leaderboard/players", label: "Players Leaderboard", icon: "👥" },
    { href: "/leaderboard/teams", label: "Teams Leaderboard", icon: "🏆" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <NavigationManager />
      <nav className="bg-white/95 backdrop-blur-md border-b-2 border-[#FFB700] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <div className="absolute inset-0 bg-[#E4E5E7] rounded-lg group-hover:bg-gray-300 transition-all duration-200 flex items-center justify-center group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Eskimos Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>
            <div className="hidden xs:block">
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-[#FF6600] to-[#CC2900] bg-clip-text text-transparent">
                Eskimos
              </span>
              <p className="text-[9px] sm:text-[10px] text-gray-500 -mt-0.5 sm:-mt-1 leading-none">Club Mode</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-[#FFB700]/20 text-[#CC2900]"
                    : "text-[#1A1A1A] hover:bg-[#E4E5E7] hover:text-[#FF6600]"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF6600] rounded-full"></span>
                )}
              </Link>
            ))}
            
            {/* Leaderboard Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsLeaderboardOpen(true)}
              onMouseLeave={() => setIsLeaderboardOpen(false)}
            >
              <button
                onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                className={`relative px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  pathname?.startsWith('/leaderboard')
                    ? "bg-[#FFB700]/20 text-[#CC2900]"
                    : "text-[#1A1A1A] hover:bg-[#E4E5E7] hover:text-[#FF6600]"
                }`}
              >
                Leaderboard
                <svg className={`w-4 h-4 transition-transform ${isLeaderboardOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {pathname?.startsWith('/leaderboard') && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF6600] rounded-full"></span>
                )}
              </button>
              
              {isLeaderboardOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border-2 border-[#FFB700] overflow-hidden z-50">
                  {leaderboardLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsLeaderboardOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFB700]/10 transition-colors text-sm font-medium text-[#1A1A1A] hover:text-[#FF6600]"
                    >
                      <span className="text-xl">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button - Desktop */}
            <button
              className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg bg-[#E4E5E7] hover:bg-gray-300 transition-all duration-200 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden xl:inline">Search</span>
            </button>

            {/* Search Icon Only - Tablet */}
            <button
              className="hidden md:flex lg:hidden items-center justify-center w-9 h-9 rounded-lg bg-[#E4E5E7] hover:bg-gray-300 transition-all duration-200 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Login Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-[#FF6600] hover:bg-[#CC2900] text-white text-sm font-semibold transition-all duration-200 border-t-2 border-[#FFB700] focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg hover:bg-[#E4E5E7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 active:scale-95"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A1A1A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t-2 border-[#FFB700] animate-slide-up bg-white/95 backdrop-blur-md">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-[#FFB700]/20 text-[#CC2900] border-l-4 border-[#FF6600]"
                      : "text-[#1A1A1A] hover:bg-[#E4E5E7] hover:text-[#FF6600] active:scale-98"
                  }`}
                >
                  {isActive(link.href) && (
                    <svg className="w-4 h-4 text-[#FF6600]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={isActive(link.href) ? "" : "ml-7"}>{link.label}</span>
                </Link>
              ))}
              
              {/* Mobile Leaderboard Section */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Leaderboard
                </div>
                {leaderboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "bg-[#FFB700]/20 text-[#CC2900] border-l-4 border-[#FF6600]"
                        : "text-[#1A1A1A] hover:bg-[#E4E5E7] hover:text-[#FF6600] active:scale-98"
                    }`}
                  >
                    {pathname === link.href && (
                      <svg className="w-4 h-4 text-[#FF6600]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={pathname === link.href ? "" : "ml-7"}>{link.icon} {link.label}</span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Search */}
              <button
                className="flex items-center gap-3 h-11 px-4 py-2.5 rounded-lg bg-[#E4E5E7] hover:bg-gray-300 transition-all duration-200 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 active:scale-98 mt-2"
                aria-label="Search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="font-medium">Search</span>
              </button>

              {/* Mobile Login */}
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="sm:hidden flex items-center justify-center gap-2 h-11 px-4 py-2.5 rounded-lg bg-[#FF6600] hover:bg-[#CC2900] text-white text-sm font-semibold transition-all duration-200 text-center border-t-2 border-[#FFB700] focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 active:scale-98"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

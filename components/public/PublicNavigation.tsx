"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationManager } from "@/lib/navigation/NavigationManager";

export default function PublicNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLeaderboardOpen(false);
  }, [pathname]);

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
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 bg-[#0D0D0D] ${scrolled
          ? "backdrop-blur-xl border-b border-[#1E1E1E] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-[#1A1A1A]"
          }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">

            {/* ── Logo ── */}
            <Link href="/" id="nav-logo" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #FF6600 0%, #CC2900 100%)", boxShadow: "0 0 15px rgba(255,102,0,0.4)" }}
                >
                  <img
                    src="/logo.png"
                    alt="Eskimos Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>
              <div className="hidden xs:block leading-none">
                <span className="text-base sm:text-lg font-black font-['Outfit',sans-serif] bg-gradient-to-r from-[#FFB700] via-[#FF6600] to-[#FFB700] bg-clip-text text-transparent bg-[length:200%] hover:bg-right transition-all duration-500">
                  Eskimos
                </span>
                <p className="text-[9px] sm:text-[10px] text-[#555] tracking-widest uppercase -mt-0.5">Club Mode</p>
              </div>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                    ? "text-[#FFB700] bg-[#FFB700]/8"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#FF6600]" />
                  )}
                </Link>
              ))}

              {/* Leaderboard dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsLeaderboardOpen(true)}
                onMouseLeave={() => setIsLeaderboardOpen(false)}
              >
                <button
                  id="nav-leaderboard"
                  onClick={() => setIsLeaderboardOpen((v) => !v)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname?.startsWith("/leaderboard")
                    ? "text-[#FFB700] bg-[#FFB700]/8"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                    }`}
                >
                  Leaderboard
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isLeaderboardOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {pathname?.startsWith("/leaderboard") && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#FF6600]" />
                  )}
                </button>

                {/* Transparent pt-2 bridge so mouse doesn't leave hover area in the gap */}
                <div className="absolute top-full left-0 w-56 pt-2">
                  <div
                    className={`rounded-xl overflow-hidden transition-all duration-200 origin-top ${isLeaderboardOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                      }`}
                    style={{
                      background: "rgba(18,18,18,0.97)",
                      border: "1px solid rgba(255,183,0,0.2)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <div className="p-1.5">
                      {leaderboardLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsLeaderboardOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-[#FF6600]/10 transition-colors text-sm font-medium text-[#A0A0A0] hover:text-white"
                        >
                          <span className="text-base">{link.icon}</span>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2">
              {/* Sign In */}
              <Link
                href="/login"
                id="nav-signin"
                className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF6600, #CC2900)",
                  boxShadow: "0 0 16px rgba(255,102,0,0.3)",
                }}
              >
                Sign In
              </Link>

              {/* Mobile hamburger */}
              <button
                id="nav-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* ── Mobile menu ── */}
          <div
            className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-screen opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
          >
            <div className="pt-2 border-t border-[#1E1E1E] flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.href)
                    ? "bg-[#FF6600]/10 text-[#FFB700] border-l-2 border-[#FF6600]"
                    : "text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Leaderboard section on mobile */}
              <div className="mt-1 pt-1 border-t border-[#1E1E1E]">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-widest uppercase text-[#555]">Leaderboard</p>
                {leaderboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === link.href
                      ? "bg-[#FF6600]/10 text-[#FFB700] border-l-2 border-[#FF6600]"
                      : "text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Sign In */}
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF6600, #CC2900)",
                  boxShadow: "0 0 20px rgba(255,102,0,0.25)",
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

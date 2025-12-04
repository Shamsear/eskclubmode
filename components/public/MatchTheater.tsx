'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicCard } from './PublicCard';
import { StatCard } from './StatCard';
import { Badge } from './Badge';

interface MatchTheaterData {
  match: {
    id: number;
    date: string;
    stageName: string | null;
    tournament: {
      id: number;
      name: string;
    };
  };
  results: Array<{
    player: {
      id: number;
      name: string;
      photo: string | null;
      club: {
        id: number;
        name: string;
        logo: string | null;
      };
    };
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    basePoints: number;
    conditionalPoints: number;
  }>;
}

interface MatchTheaterProps {
  data: MatchTheaterData;
}

const outcomeConfig = {
  WIN: {
    variant: 'success' as const,
    label: 'Victory',
    icon: '🏆',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
  },
  DRAW: {
    variant: 'warning' as const,
    label: 'Draw',
    icon: '🤝',
    bgGradient: 'from-yellow-500/10 to-amber-500/10',
  },
  LOSS: {
    variant: 'danger' as const,
    label: 'Defeat',
    icon: '⚔️',
    bgGradient: 'from-red-500/10 to-rose-500/10',
  },
};

export function MatchTheater({ data }: MatchTheaterProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const matchDate = new Date(data.match.date);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div
          className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div
            className={`
              transition-all duration-1000 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-white/80">
                <li>
                  <Link href="/matches" className="hover:text-white transition-colors">
                    Matches
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/tournaments/${data.match.tournament.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {data.match.tournament.name}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-white font-medium" aria-current="page">
                  Match #{data.match.id}
                </li>
              </ol>
            </nav>

            {/* Match Header */}
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Match Theater
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-6">
                {data.match.tournament.name}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">📅</span>
                  <time dateTime={data.match.date}>
                    {matchDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                {data.match.stageName && (
                  <>
                    <span aria-hidden="true">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden="true">🎯</span>
                      <span>{data.match.stageName}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="currentColor"
              className="text-gray-50"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Match Statistics Overview */}
          <div
            className={`
              mb-12 transition-all duration-1000 delay-300 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Players"
                value={data.results.length}
                icon="👥"
                color="primary"
              />
              <StatCard
                label="Total Goals"
                value={data.results.reduce((sum, r) => sum + r.goalsScored, 0)}
                icon="⚽"
                color="success"
              />
              <StatCard
                label="Winners"
                value={data.results.filter((r) => r.outcome === 'WIN').length}
                icon="🏆"
                color="warning"
              />
              <StatCard
                label="Total Points"
                value={data.results.reduce((sum, r) => sum + r.pointsEarned, 0)}
                icon="📊"
                color="neutral"
              />
            </div>
          </div>

          {/* Player Performance Cards */}
          <div
            className={`
              transition-all duration-1000 delay-500 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Player Performances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.results.map((result, index) => (
                <PlayerPerformanceCard
                  key={result.player.id}
                  result={result}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlayerPerformanceCardProps {
  result: MatchTheaterData['results'][0];
  index: number;
}

function PlayerPerformanceCard({ result, index }: PlayerPerformanceCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = outcomeConfig[result.outcome];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <PublicCard
      variant="elevated"
      hover
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Outcome Banner */}
      <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-3 -mx-6 -mt-6 mb-4`}>
        <div className="flex items-center justify-between">
          <Badge variant={config.variant} size="md" icon={<span>{config.icon}</span>}>
            {config.label}
          </Badge>
          <div className="text-2xl font-bold text-gray-900">
            {result.pointsEarned} pts
          </div>
        </div>
      </div>

      {/* Player Info */}
      <Link
        href={`/players/${result.player.id}`}
        className="block group mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {result.player.photo ? (
              <Image
                src={result.player.photo}
                alt={result.player.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {result.player.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {result.player.club.logo && (
                <div className="relative w-4 h-4">
                  <Image
                    src={result.player.club.logo}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="truncate">{result.player.club.name}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Performance Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Goals Scored</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.goalsScored}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Goals Conceded</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.goalsConceded}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Goal Difference</span>
          <span
            className={`text-lg font-semibold ${
              result.goalsScored - result.goalsConceded > 0
                ? 'text-green-600'
                : result.goalsScored - result.goalsConceded < 0
                ? 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            {result.goalsScored - result.goalsConceded > 0 ? '+' : ''}
            {result.goalsScored - result.goalsConceded}
          </span>
        </div>
      </div>

      {/* Points Breakdown */}
      {(result.basePoints > 0 || result.conditionalPoints > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Points Breakdown
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Points</span>
              <span className="font-medium text-gray-900">{result.basePoints}</span>
            </div>
            {result.conditionalPoints > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus Points</span>
                <span className="font-medium text-green-600">
                  +{result.conditionalPoints}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </PublicCard>
  );
}

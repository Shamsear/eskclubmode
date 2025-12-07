'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './Badge';
import { RankAnimation, StaggerContainer, StaggerItem, AnimatedCounter } from '@/lib/animations';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  club: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
}

interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  totalPoints: number;
}

interface LeaderboardEntry {
  rank: number;
  player: Player;
  stats: PlayerStats;
}

interface LeaderboardStreamProps {
  tournament: {
    id: number;
    name: string;
  };
  rankings: LeaderboardEntry[];
}

function RankBadge({ rank }: { rank: number }) {
  let badgeClass = 'bg-gray-100 text-gray-800 border-gray-300';
  let icon = null;

  if (rank === 1) {
    badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    icon = '🥇';
  } else if (rank === 2) {
    badgeClass = 'bg-gray-200 text-gray-800 border-gray-400';
    icon = '🥈';
  } else if (rank === 3) {
    badgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
    icon = '🥉';
  }

  return (
    <div
      className={`
        flex items-center justify-center
        w-10 h-10 sm:w-12 sm:h-12
        rounded-full border-2 font-bold text-sm sm:text-base
        flex-shrink-0
        ${badgeClass}
      `}
      aria-label={`Rank ${rank}`}
    >
      {icon || `#${rank}`}
    </div>
  );
}

function StatDisplay({ label, value, className = '' }: { label: string; value: number | string; className?: string }) {
  return (
    <div className={`text-center min-w-[60px] ${className}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm sm:text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function LeaderboardRow({ entry, isExpanded, onToggle }: {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { rank, player, stats } = entry;

  return (
    <div
      className="
        bg-white border border-gray-200 rounded-lg overflow-hidden
        transition-all duration-300 hover:shadow-md
      "
    >
      {/* Main Row - Touch optimized */}
      <button
        onClick={onToggle}
        className="w-full min-h-[44px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-label={`${player.name} - Rank ${rank}, ${stats.totalPoints} points. Click to ${isExpanded ? 'collapse' : 'expand'} details`}
      >
        {/* Rank Badge */}
        <RankBadge rank={rank} />

        {/* Player Photo */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {player.photo ? (
            <Image
              src={player.photo}
              alt={player.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/players/${player.id}`}
            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {player.name}
          </Link>
          {player.club && (
            <div className="text-xs sm:text-sm text-gray-600 truncate">
              {player.club.name}
            </div>
          )}
        </div>

        {/* Key Stats - Responsive visibility */}
        <div className="hidden md:flex items-center gap-3 lg:gap-6">
          <StatDisplay label="MP" value={stats.matchesPlayed} />
          <StatDisplay label="W" value={stats.wins} className="text-green-600" />
          <StatDisplay label="D" value={stats.draws} className="text-gray-600" />
          <StatDisplay label="L" value={stats.losses} className="text-red-600" />
          <StatDisplay label="GD" value={stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference} />
        </div>

        {/* Points Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg" className="font-bold">
            <AnimatedCounter value={stats.totalPoints} format={(v) => `${Math.round(v)} pts`} />
          </Badge>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-200 bg-gray-50"
          role="region"
          aria-label="Detailed statistics"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Matches Played</div>
              <div className="text-xl font-bold text-gray-900">{stats.matchesPlayed}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-xs text-gray-500 mb-1">Wins</div>
              <div className="text-xl font-bold text-green-600">{stats.wins}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Draws</div>
              <div className="text-xl font-bold text-gray-600">{stats.draws}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <div className="text-xs text-gray-500 mb-1">Losses</div>
              <div className="text-xl font-bold text-red-600">{stats.losses}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-gray-500 mb-1">Goals Scored</div>
              <div className="text-xl font-bold text-blue-600">{stats.goalsScored}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <div className="text-xs text-gray-500 mb-1">Goals Conceded</div>
              <div className="text-xl font-bold text-orange-600">{stats.goalsConceded}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="text-xs text-gray-500 mb-1">Goal Difference</div>
              <div className={`text-xl font-bold ${stats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary-200">
              <div className="text-xs text-gray-500 mb-1">Total Points</div>
              <div className="text-xl font-bold text-primary-600">{stats.totalPoints}</div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Win Rate</span>
              <span className="font-semibold">
                {stats.matchesPlayed > 0
                  ? `${((stats.wins / stats.matchesPlayed) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: stats.matchesPlayed > 0
                    ? `${(stats.wins / stats.matchesPlayed) * 100}%`
                    : '0%',
                }}
                role="progressbar"
                aria-valuenow={stats.matchesPlayed > 0 ? (stats.wins / stats.matchesPlayed) * 100 : 0}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardStream({ tournament, rankings }: LeaderboardStreamProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };

  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Rankings Yet
        </h3>
        <p className="text-gray-600">
          The leaderboard will be populated once matches are completed.
        </p>
      </div>
    );
  }

  return (
    <StaggerContainer speed="fast">
      <div className="space-y-3">
        {rankings.map((entry) => (
          <StaggerItem key={entry.player.id}>
            <RankAnimation currentRank={entry.rank}>
              <LeaderboardRow
                entry={entry}
                isExpanded={expandedRows.has(entry.rank)}
                onToggle={() => toggleRow(entry.rank)}
              />
            </RankAnimation>
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  );
}

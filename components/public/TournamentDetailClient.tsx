'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicCard, CardContent, CardHeader, CardTitle } from './PublicCard';
import { StatCard } from './StatCard';
import TournamentJourneyMap from './TournamentJourneyMap';

interface TournamentDetailData {
  tournament: {
    id: number;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    } | null;
    pointSystem: {
      pointsPerWin: number;
      pointsPerDraw: number;
      pointsPerLoss: number;
      pointsPerGoalScored: number;
      pointsPerGoalConceded: number;
    };
  };
  stages: Array<{
    id: number;
    name: string;
    order: number;
    matchCount: number;
  }>;
  stats: {
    totalMatches: number;
    completedMatches: number;
    totalGoals: number;
    participantCount: number;
  };
}

interface TournamentDetailClientProps {
  initialData: TournamentDetailData;
  tournamentId: number;
}

export default function TournamentDetailClient({
  initialData,
  tournamentId,
}: TournamentDetailClientProps) {
  const { tournament, stages, stats } = initialData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatus = (): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    if (startDate > now) {
      return 'upcoming';
    } else if (!endDate || endDate >= now) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  const status = getStatus();
  const completionPercentage =
    stats.totalMatches > 0
      ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-gray-600">
          <li>
            <Link href="/tournaments" className="hover:text-primary-600 transition-colors">
              Tournaments
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium truncate">{tournament.name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl">
                {tournament.description}
              </p>
            )}
          </div>
          
          {tournament.club && (
            <Link
              href={`/clubs/${tournament.club.id}`}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group"
            >
              {tournament.club.logo ? (
                <img
                  src={tournament.club.logo}
                  alt={tournament.club.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                  {tournament.club.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Organized by</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {tournament.club.name}
                </p>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDate(tournament.startDate)}
              {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
            </span>
          </div>

          <div
            className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ${
                status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <StatCard
          label="Participants"
          value={stats.participantCount}
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Matches"
          value={stats.totalMatches}
          color="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats.completedMatches}
          color="warning"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Goals"
          value={stats.totalGoals}
          color="danger"
          icon={<span className="text-2xl">⚽</span>}
        />
      </div>

      {/* Progress Bar */}
      {stats.totalMatches > 0 && (
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tournament Progress</span>
            <span className="text-sm font-semibold text-primary-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Tournament Journey Map */}
      {stages.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Tournament Journey
          </h2>
          <TournamentJourneyMap stages={stages} tournamentId={tournamentId} />
        </div>
      )}

      {/* Point System */}
      <PublicCard className="mb-8 sm:mb-12">
        <CardHeader>
          <CardTitle>Point System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Win</span>
              <span className="text-2xl font-bold text-green-600">
                {tournament.pointSystem.pointsPerWin}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-gray-700">Draw</span>
              <span className="text-2xl font-bold text-yellow-600">
                {tournament.pointSystem.pointsPerDraw}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm font-medium text-gray-700">Loss</span>
              <span className="text-2xl font-bold text-red-600">
                {tournament.pointSystem.pointsPerLoss}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-gray-700">Goal Scored</span>
              <span className="text-2xl font-bold text-blue-600">
                +{tournament.pointSystem.pointsPerGoalScored}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-sm font-medium text-gray-700">Goal Conceded</span>
              <span className="text-2xl font-bold text-purple-600">
                {tournament.pointSystem.pointsPerGoalConceded}
              </span>
            </div>
          </div>
        </CardContent>
      </PublicCard>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/tournaments/${tournamentId}/leaderboard`}
          className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-center transition-all shadow-md hover:shadow-lg"
        >
          View Leaderboard
        </Link>
        <Link
          href={`/tournaments/${tournamentId}/matches`}
          className="flex-1 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-lg font-semibold text-center transition-all"
        >
          View All Matches
        </Link>
      </div>
    </div>
  );
}

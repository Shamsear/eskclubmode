import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Match {
  id: number;
  date: string;
  stage: {
    id: number;
    name: string;
  };
  player1: {
    id: number;
    name: string;
    photo: string | null;
  };
  player2: {
    id: number;
    name: string;
    photo: string | null;
  } | null;
  player1Score: number | null;
  player2Score: number | null;
  winner: {
    id: number;
    name: string;
  } | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface TournamentMatchesData {
  tournament: {
    id: number;
    name: string;
  };
  matches: Match[];
}

async function getTournamentMatches(id: number): Promise<TournamentMatchesData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/tournaments/${id}/matches`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      
      if (response.status === 404) {
        return null;
      }
      
      // Return null instead of throwing to show empty state
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    // Return null to show empty state instead of crashing
    return null;
  }
}

async function TournamentMatchesContent({ tournamentId }: { tournamentId: number }) {
  const data = await getTournamentMatches(tournamentId);

  if (!data) {
    notFound();
  }

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-700 border-green-400';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-700 border-blue-400';
      case 'SCHEDULED':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-400';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-700 border-red-400';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-400';
    }
  };

  const groupedMatches = data.matches.reduce((acc, match) => {
    const stageName = match.stage.name;
    if (!acc[stageName]) {
      acc[stageName] = [];
    }
    acc[stageName].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="min-h-screen bg-[#E4E5E7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link href="/tournaments" className="hover:text-[#FF6600] transition-colors font-medium">
                Tournaments
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href={`/tournaments/${data.tournament.id}`} className="hover:text-[#FF6600] transition-colors font-medium">
                {data.tournament.name}
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#1A1A1A] font-semibold">Matches</li>
          </ol>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                    All Matches
                  </h1>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl">
                {data.tournament.name}
              </p>
            </div>

            <Link
              href={`/tournaments/${data.tournament.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tournament
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Matches</div>
              <svg className="w-6 h-6 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">{data.matches.length}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Completed</div>
              <svg className="w-6 h-6 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {data.matches.filter(m => m.status === 'COMPLETED').length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Scheduled</div>
              <svg className="w-6 h-6 text-[#CC2900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {data.matches.filter(m => m.status === 'SCHEDULED').length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Stages</div>
              <svg className="w-6 h-6 text-[#FF6600]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {Object.keys(groupedMatches).length}
            </div>
          </div>
        </div>
      </div>

      {/* Matches by Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {Object.entries(groupedMatches).map(([stageName, matches]) => (
          <div key={stageName} className="mb-12">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
                <h2 className="text-3xl font-bold text-[#1A1A1A]">
                  {stageName}
                </h2>
                <span className="text-sm text-gray-600 font-medium">
                  ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#FF6600] group"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Players */}
                      <div className="flex-1 flex items-center justify-between gap-4">
                        {/* Player 1 */}
                        <div className="flex items-center gap-3 flex-1">
                          {match.player1.photo ? (
                            <img
                              src={match.player1.photo}
                              alt={match.player1.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6600]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                              <span className="text-xl font-bold text-white">
                                {match.player1.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FF6600] transition-colors">
                              {match.player1.name}
                            </div>
                            {match.status === 'COMPLETED' && match.winner?.id === match.player1.id && (
                              <div className="text-xs text-green-600 font-semibold">Winner</div>
                            )}
                          </div>
                          {match.player1Score !== null && (
                            <div className="text-3xl font-bold text-[#FF6600]">
                              {match.player1Score}
                            </div>
                          )}
                        </div>

                        {/* VS */}
                        <div className="flex-shrink-0 px-4">
                          <div className="text-2xl font-bold text-gray-400">VS</div>
                        </div>

                        {/* Player 2 */}
                        <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                          {match.player2 ? (
                            <>
                              {match.player2.photo ? (
                                <img
                                  src={match.player2.photo}
                                  alt={match.player2.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6600]"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                                  <span className="text-xl font-bold text-white">
                                    {match.player2.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0 text-right">
                                <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FF6600] transition-colors">
                                  {match.player2.name}
                                </div>
                                {match.status === 'COMPLETED' && match.winner?.id === match.player2.id && (
                                  <div className="text-xs text-green-600 font-semibold">Winner</div>
                                )}
                              </div>
                              {match.player2Score !== null && (
                                <div className="text-3xl font-bold text-[#FF6600]">
                                  {match.player2Score}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex-1 text-center text-gray-400 italic">
                              TBD
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(match.status)}`}>
                          {match.status.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(match.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Bar */}
                  <div className="h-1 bg-gradient-to-r from-[#FF6600] via-[#FFB700] to-[#CC2900] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {data.matches.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF6600]/10 to-[#CC2900]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              No Matches Yet
            </h3>
            <p className="text-gray-600">
              Matches will appear here once they are scheduled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function TournamentMatchesPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#E4E5E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-300 rounded-lg w-1/3"></div>
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                    <div className="text-2xl font-bold text-gray-300">VS</div>
                    <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <TournamentMatchesContent tournamentId={tournamentId} />
    </Suspense>
  );
}

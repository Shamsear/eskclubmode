'use client';

import React from 'react';
import {
  StatCard,
  Badge,
  RoleBadge,
  AchievementBadge,
  StatusBadge,
  PublicCard,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Card3D,
  TournamentCardSkeleton,
  MatchTheaterSkeleton,
  LeaderboardSkeleton,
  PlayerProfileSkeleton,
  ClubCardSkeleton,
  StatCardSkeleton,
  TournamentJourneySkeleton,
} from '@/components/public';

export default function ComponentsDemoPage() {
  const [showSkeletons, setShowSkeletons] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Public Platform Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Showcase of all shared UI components for the public sports platform
          </p>
        </div>

        {/* Skeleton Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowSkeletons(!showSkeletons)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
          </button>
        </div>

        {showSkeletons ? (
          <>
            {/* Skeleton Loaders */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skeleton Loaders</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Stat Cards</h3>
                  <StatCardSkeleton count={4} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Tournament Cards</h3>
                  <TournamentCardSkeleton count={3} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Club Cards</h3>
                  <ClubCardSkeleton count={3} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Leaderboard</h3>
                  <LeaderboardSkeleton count={5} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Match Theater</h3>
                  <MatchTheaterSkeleton />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Player Profile</h3>
                  <PlayerProfileSkeleton />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Tournament Journey</h3>
                  <TournamentJourneySkeleton />
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Stat Cards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Stat Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Points"
                  value={1250}
                  color="primary"
                  icon="🏆"
                  trend="up"
                />
                <StatCard
                  label="Win Rate"
                  value={75.5}
                  format="percentage"
                  color="success"
                  icon="📈"
                  trend="up"
                />
                <StatCard
                  label="Goals Scored"
                  value={42}
                  color="warning"
                  icon="⚽"
                  trend="neutral"
                />
                <StatCard
                  label="Matches Played"
                  value={28}
                  color="neutral"
                  icon="🎯"
                />
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Badge Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm" variant="primary">Small</Badge>
                    <Badge size="md" variant="primary">Medium</Badge>
                    <Badge size="lg" variant="primary">Large</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Role Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <RoleBadge role="PLAYER" />
                    <RoleBadge role="CAPTAIN" />
                    <RoleBadge role="MENTOR" />
                    <RoleBadge role="MANAGER" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Achievement Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <AchievementBadge type="tournament_win" label="Champion 2024" />
                    <AchievementBadge type="top_scorer" label="Top Scorer" />
                    <AchievementBadge type="most_active" label="Most Active" />
                    <AchievementBadge type="custom" label="Custom Award" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Status Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="upcoming" />
                    <StatusBadge status="active" />
                    <StatusBadge status="completed" />
                  </div>
                </div>
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Card Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PublicCard variant="default">
                      <CardTitle>Default Card</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Standard card with border and shadow</p>
                      </CardContent>
                    </PublicCard>

                    <PublicCard variant="elevated">
                      <CardTitle>Elevated Card</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Card with enhanced shadow</p>
                      </CardContent>
                    </PublicCard>

                    <PublicCard variant="outlined">
                      <CardTitle>Outlined Card</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Card with prominent border</p>
                      </CardContent>
                    </PublicCard>

                    <PublicCard variant="glass">
                      <CardTitle>Glass Card</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Card with glassmorphism effect</p>
                      </CardContent>
                    </PublicCard>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Hover Effects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PublicCard hover>
                      <CardTitle>Hover Me</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Card with hover animation</p>
                      </CardContent>
                    </PublicCard>

                    <PublicCard hover onClick={() => alert('Card clicked!')}>
                      <CardTitle>Clickable Card</CardTitle>
                      <CardContent>
                        <p className="text-gray-600">Click to trigger action</p>
                      </CardContent>
                    </PublicCard>

                    <PublicCard hover>
                      <CardHeader>
                        <CardTitle>Full Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Card with header and footer</p>
                      </CardContent>
                      <CardFooter>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Learn More →
                        </button>
                      </CardFooter>
                    </PublicCard>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">3D Cards (Club Universe)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card3D>
                      <div className="p-6">
                        <div className="text-4xl mb-4">🏆</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Champions FC
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Elite football club with 50+ members
                        </p>
                        <div className="flex gap-2">
                          <AchievementBadge type="tournament_win" label="Winner" size="sm" />
                          <StatusBadge status="active" size="sm" />
                        </div>
                      </div>
                    </Card3D>

                    <Card3D>
                      <div className="p-6">
                        <div className="text-4xl mb-4">⚽</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          United Sports
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Community sports organization
                        </p>
                        <div className="flex gap-2">
                          <AchievementBadge type="most_active" label="Active" size="sm" />
                          <StatusBadge status="active" size="sm" />
                        </div>
                      </div>
                    </Card3D>

                    <Card3D>
                      <div className="p-6">
                        <div className="text-4xl mb-4">🎯</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Victory Club
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Professional sports club
                        </p>
                        <div className="flex gap-2">
                          <AchievementBadge type="top_scorer" label="Top" size="sm" />
                          <StatusBadge status="completed" size="sm" />
                        </div>
                      </div>
                    </Card3D>
                  </div>
                </div>
              </div>
            </section>

            {/* Combined Example */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Combined Example</h2>
              <PublicCard variant="elevated" hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tournament Overview</CardTitle>
                    <StatusBadge status="active" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                      label="Participants"
                      value={24}
                      color="primary"
                      icon="👥"
                    />
                    <StatCard
                      label="Matches"
                      value={48}
                      color="success"
                      icon="⚽"
                    />
                    <StatCard
                      label="Goals"
                      value={156}
                      color="warning"
                      icon="🎯"
                      trend="up"
                    />
                    <StatCard
                      label="Completion"
                      value={67.5}
                      format="percentage"
                      color="info"
                      icon="📊"
                      trend="up"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" icon="🏆">Premier League</Badge>
                    <Badge variant="success" icon="✓">Verified</Badge>
                    <Badge variant="info" icon="📅">2024 Season</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last updated: 2 hours ago</span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </CardFooter>
              </PublicCard>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

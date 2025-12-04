'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      role="status"
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

// Role-specific badge component
interface RoleBadgeProps {
  role: 'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER';
  size?: BadgeSize;
  className?: string;
}

const roleConfig: Record<string, { variant: BadgeVariant; icon: string; label: string }> = {
  PLAYER: {
    variant: 'primary',
    icon: '⚽',
    label: 'Player',
  },
  CAPTAIN: {
    variant: 'warning',
    icon: '👑',
    label: 'Captain',
  },
  MENTOR: {
    variant: 'info',
    icon: '🎓',
    label: 'Mentor',
  },
  MANAGER: {
    variant: 'success',
    icon: '📋',
    label: 'Manager',
  },
};

export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={<span>{config.icon}</span>}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Achievement badge component
interface AchievementBadgeProps {
  type: 'tournament_win' | 'top_scorer' | 'most_active' | 'custom';
  label: string;
  size?: BadgeSize;
  className?: string;
}

const achievementConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
  tournament_win: {
    variant: 'success',
    icon: '🏆',
  },
  top_scorer: {
    variant: 'warning',
    icon: '⚡',
  },
  most_active: {
    variant: 'info',
    icon: '🌟',
  },
  custom: {
    variant: 'neutral',
    icon: '🎖️',
  },
};

export function AchievementBadge({
  type,
  label,
  size = 'md',
  className = '',
}: AchievementBadgeProps) {
  const config = achievementConfig[type];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={<span>{config.icon}</span>}
      className={className}
    >
      {label}
    </Badge>
  );
}

// Status badge component
interface StatusBadgeProps {
  status: 'upcoming' | 'active' | 'completed';
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  upcoming: {
    variant: 'info',
    label: 'Upcoming',
  },
  active: {
    variant: 'success',
    label: 'Active',
  },
  completed: {
    variant: 'neutral',
    label: 'Completed',
  },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

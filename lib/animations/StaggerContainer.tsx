'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { animationVariants, prefersReducedMotion } from './config';

type StaggerSpeed = 'fast' | 'normal' | 'slow';

interface StaggerContainerProps extends Omit<MotionProps, 'variants' | 'initial' | 'animate'> {
  children: React.ReactNode;
  speed?: StaggerSpeed;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol' | 'nav';
}

/**
 * StaggerContainer - Container for staggered child animations
 * Children should use StaggerItem component
 */
export function StaggerContainer({
  children,
  speed = 'normal',
  className = '',
  as = 'div',
  ...motionProps
}: StaggerContainerProps) {
  const shouldAnimate = !prefersReducedMotion();

  const variantKey = speed === 'fast' 
    ? 'staggerContainerFast' 
    : speed === 'slow' 
    ? 'staggerContainerSlow' 
    : 'staggerContainer';

  if (!shouldAnimate) {
    return React.createElement(as, { className }, children);
  }

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationVariants[variantKey]}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}

interface StaggerItemProps extends Omit<MotionProps, 'variants'> {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * StaggerItem - Individual item within a StaggerContainer
 */
export function StaggerItem({
  children,
  className = '',
  as = 'div',
  ...motionProps
}: StaggerItemProps) {
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return React.createElement(as, { className }, children);
  }

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      variants={animationVariants.staggerItem}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}

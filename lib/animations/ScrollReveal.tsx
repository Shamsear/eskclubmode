'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { animationDuration, animationEasing, prefersReducedMotion } from './config';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

/**
 * ScrollReveal - Reveals content when it enters the viewport
 * Perfect for Match Theater and other scroll-triggered animations
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: animationDuration.slow,
        delay,
        ease: animationEasing.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

/**
 * Parallax - Creates parallax scrolling effect
 * Used in Match Theater hero section
 */
export function Parallax({ children, className = '', offset = 50 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface ScrollProgressProps {
  className?: string;
}

/**
 * ScrollProgress - Shows scroll progress indicator
 */
export function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return null;
  }

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50 ${className}`}
      style={{ scaleX: scrollYProgress }}
    />
  );
}

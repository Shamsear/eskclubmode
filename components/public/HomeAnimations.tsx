'use client';

import { motion } from 'framer-motion';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Stagger-animates hero content (badge, h1, subtitle, CTAs, stats) */
export function HeroContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a single stat pill on scroll-enter */
export function StatPill({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a feature card on scroll-enter */
export function FeatureCardWrapper({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Animates the live stats band numbers on scroll-enter */
export function StatBandItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease }}
      className="text-center group"
    >
      {children}
    </motion.div>
  );
}

/** Section wrapper — slides up when it enters the viewport */
export function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/app/components/portfolio/motion-tokens";

export function RouteTransition({ children }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 };
  const animate = { opacity: 1, y: 0 };
  const exit = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 };
  const duration = shouldReduceMotion ? MOTION.duration.fast : MOTION.duration.route;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ duration, ease: MOTION.ease.standard }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Reveal({ children, className = "", delay = 0, once = true }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: MOTION.duration.reveal, ease: MOTION.ease.standard, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = "", once = true }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: MOTION.stagger.cards,
          },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION.duration.route,
            ease: MOTION.ease.standard,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
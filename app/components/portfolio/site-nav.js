"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/app/components/portfolio/motion-tokens";

export default function SiteNav() {
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActivePath = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.nav
      className="top-nav"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? MOTION.duration.fast : MOTION.duration.base,
        ease: MOTION.ease.standard,
      }}
    >
      <Link className="flex items-center gap-3" href="/">
        <span className="flex h-10 w-10 items-center justify-center border border-(--border)">
          <Image
            src="/logo_black.png"
            alt="Joseph Garba logo"
            width={32}
            height={32}
            className="object-contain dark:invert"
            priority
          />
        </span>
        <span className="hidden text-[13px] uppercase tracking-[0.15em] text-(--text-sub) sm:block">
          Joseph Garba
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const isActive = isActivePath(link.href);

          return (
            <motion.div
              key={link.href}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.standard }}
            >
              <Link
                className={`btn ${isActive ? "btn-active" : ""}`}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}

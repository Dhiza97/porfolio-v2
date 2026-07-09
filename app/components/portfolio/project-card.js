"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/app/components/portfolio/motion-tokens";

export default function ProjectCard({ project }) {
  const shouldReduceMotion = useReducedMotion();
  const isPopulated = Boolean(project.title);
  const description = project.description || "";
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    if (!isPopulated || expanded) {
      return;
    }

    const node = descriptionRef.current;
    if (!node) {
      return;
    }

    const checkOverflow = () => {
      setCanExpand(node.scrollHeight > node.clientHeight + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [description, expanded, isPopulated]);

  return (
    <motion.article
      layout
      className="card-soft flex h-full flex-col overflow-hidden"
      transition={{
        layout: {
          duration: shouldReduceMotion ? MOTION.duration.fast : MOTION.duration.layout,
          ease: MOTION.ease.standard,
        },
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <div className="group relative aspect-video overflow-hidden border-b border-(--border) bg-(--bg3)">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title || "Project image"}
            fill
            unoptimized
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="motion-media-zoom object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-ital text-3xl text-(--text-muted)">No image</span>
          </div>
        )}
      </div>

      <div className="flex min-h-64 flex-1 flex-col p-4">
        {isPopulated ? (
          <>
            <h2 className="line-clamp-2 font-headline text-4xl leading-none">{project.title}</h2>
            {project.tags?.length > 0 && (
              <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-(--text-muted)">
                {project.tags.join(" / ")}
              </p>
            )}
            <motion.p
              layout
              ref={descriptionRef}
              className={`mt-3 text-sm leading-7 text-(--text-sub) ${expanded ? "" : "line-clamp-4"}`}
            >
              {description}
            </motion.p>
            {(expanded || canExpand) && (
              <motion.button
                type="button"
                onClick={() => setExpanded((state) => !state)}
                className="motion-color-shift mt-2 w-fit text-[11px] uppercase tracking-[0.15em] text-(--text-muted) hover:text-foreground"
                whileHover={shouldReduceMotion ? undefined : { x: 1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.standard }}
              >
                {expanded ? "Read less" : "Read more"}
              </motion.button>
            )}

            <div className={`${expanded ? "mt-4" : "mt-auto pt-4"} flex flex-wrap gap-2`}>
              {project.liveUrl && (
                <a className="btn" href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live
                </a>
              )}
              {project.repoUrl && (
                <a className="btn" href={project.repoUrl} target="_blank" rel="noreferrer">
                  Code
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="font-headline text-4xl leading-none">No Projects Yet</h2>
            <p className="mt-3 line-clamp-4 text-sm leading-7 text-(--text-sub)">
              Add projects from the admin panel to populate this page.
            </p>
          </>
        )}
      </div>
    </motion.article>
  );
}

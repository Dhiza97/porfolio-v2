import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/app/components/portfolio/motion";
import { getPublicProjects } from "@/app/lib/projects";

export default async function HomePage() {
  const { projects, dbHealthy } = await getPublicProjects();
  const featured = projects.slice(0, 3);

  return (
    <main className="frame-shell pb-12">

      <Reveal className="relative min-h-[calc(100vh-68px)] overflow-hidden py-14 sm:py-20">
        <div className="max-w-230">
          <p className="label mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-(--border)" />
            Software Engineer
          </p>
          <h1 className="font-headline text-[clamp(5rem,14vw,13rem)] leading-[0.88] tracking-[-0.01em]">
            <span className="block">JOSEPH</span>
            <span className="block">GARBA</span>
          </h1>
          <p className="mt-7 max-w-140 font-ital text-[clamp(1.05rem,2vw,1.3rem)] leading-[1.7] text-(--text-sub)">
            Building reliable product systems and clear interfaces where engineering
            discipline meets visual craft.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn" href="/projects">
              View Projects
            </Link>
            <Link className="btn" href="/contact">
              Get in Touch
            </Link>
          </div>
        </div>

        <span className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 font-headline text-[clamp(8rem,18vw,21rem)] leading-none text-(--border) lg:block">
          JG
        </span>
      </Reveal>

      <section className="section-line overflow-hidden bg-(--bg2) py-3">
        <div className="marquee-track flex min-w-max gap-10 whitespace-nowrap text-[0.95rem] text-(--text-muted)">
          <span className="font-ital">Backend Systems</span>
          <span className="font-ital">API Design</span>
          <span className="font-ital">Database Resilience</span>
          <span className="font-ital">Performance</span>
          <span className="font-ital">Interface Engineering</span>
          <span className="font-ital">Backend Systems</span>
          <span className="font-ital">API Design</span>
          <span className="font-ital">Database Resilience</span>
          <span className="font-ital">Performance</span>
          <span className="font-ital">Interface Engineering</span>
        </div>
      </section>

      {!dbHealthy && (
        <p className="border-b border-(--border) py-4 text-center text-sm text-(--text-sub)">
          Portfolio data is temporarily unavailable. Rendering static shell while
          datastore recovers.
        </p>
      )}

      <Reveal className="py-12 sm:py-16" delay={0.04}>
        <header className="mb-8 border-b border-(--border) pb-5">
          <h2 className="font-headline text-[clamp(3rem,6vw,5rem)] leading-none">Featured Work</h2>
          <p className="mt-2 font-ital text-[1.05rem] text-(--text-muted)">
            Selected projects from the full archive.
          </p>
        </header>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(featured.length ? featured : [{ _id: "placeholder" }]).map((project) => (
            <StaggerItem key={project._id}>
              <article className="card-soft p-5">
              {project.title ? (
                <>
                  <p className="pill inline-block">{project.featured ? "Featured" : "Project"}</p>
                  <h3 className="mt-3 font-headline text-4xl leading-none">{project.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-(--text-sub) line-clamp-4">
                    {project.description}
                  </p>
                  <div className="mt-5">
                    <Link className="btn" href={`/projects/${project._id}`}>
                      View Project
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-headline text-4xl leading-none">COMING SOON</h3>
                  <p className="mt-4 text-sm leading-7 text-(--text-sub)">
                    Publish projects from the admin panel to populate this section.
                  </p>
                </>
              )}
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8">
          <Link className="btn" href="/projects">
            Browse All Projects
          </Link>
        </div>
      </Reveal>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border) py-6 text-[11px] uppercase tracking-[0.14em] text-(--text-muted)">
        <span>Joseph Garba © {new Date().getFullYear()}</span>
        <span>Black/White system</span>
      </footer>
    </main>
  );
}

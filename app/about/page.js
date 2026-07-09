import { Reveal } from "@/app/components/portfolio/motion";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="frame-shell pb-12">

      <section className="grid grid-cols-1 border-b border-(--border) py-12 md:grid-cols-2 md:py-16">
        <Reveal className="border-b border-(--border) p-8 md:border-b-0 md:border-r md:p-10">
          <p className="label">Who I Am</p>
          <h1 className="mt-4 font-headline text-[clamp(2.8rem,6vw,5rem)] leading-[0.92]">
            Design with purpose.
          </h1>
          <p className="mt-6 text-sm leading-8 text-(--text-sub)">
            I build software products with deliberate architecture, clear visual
            hierarchy, and systems that remain maintainable over time.
          </p>
          <p className="mt-4 text-sm leading-8 text-(--text-sub)">
            My focus spans backend reliability, frontend performance, and product
            surfaces that are simple to use and simple to evolve.
          </p>
        </Reveal>

        <Reveal className="p-8 md:p-10" delay={0.06}>
          <div className="card-soft flex aspect-3/4 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border border-(--border) font-headline text-5xl">
                JG
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-(--text-muted)">
                Portrait placeholder
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px bg-(--border) border border-(--border)">
            {[
              "Backend Systems",
              "API Design",
              "Database Modeling",
              "UI Engineering",
              "Performance",
              "Product Thinking",
            ].map((skill) => (
              <div key={skill} className="bg-background p-3 text-[11px] uppercase tracking-widest text-(--text-sub)">
                {skill}
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}

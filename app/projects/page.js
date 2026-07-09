import { Reveal, Stagger, StaggerItem } from "@/app/components/portfolio/motion";
import ProjectCard from "@/app/components/portfolio/project-card";
import { getPublicProjects } from "@/app/lib/projects";

export const metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const { projects, dbHealthy } = await getPublicProjects();

  return (
    <main className="frame-shell pb-12">

      <Reveal className="py-12 sm:py-16">
        <header className="mb-8 border-b border-(--border) pb-5">
          <h1 className="font-headline text-[clamp(3rem,6vw,5rem)] leading-none">Selected Work</h1>
          <p className="mt-2 font-ital text-[1.05rem] text-(--text-muted)">
            A curated collection of design and engineering projects.
          </p>
        </header>

        {!dbHealthy && (
          <p className="mb-6 border border-(--border) p-4 text-sm text-(--text-sub)">
            Data layer is currently unavailable. Showing fallback state.
          </p>
        )}

        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(projects.length ? projects : [{ _id: "placeholder" }]).map((project) => (
            <StaggerItem key={project._id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>
    </main>
  );
}
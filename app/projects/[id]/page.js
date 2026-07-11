import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/app/components/portfolio/motion";
import { RichText } from "@/app/components/portfolio/rich-text";
import { getProjectNeighbors, getPublicProjectById } from "@/app/lib/projects";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { project } = await getPublicProjectById(id);

  if (!project) {
    return { title: "Project" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

function StoryBlock({ title, text, imageUrl, reverse }) {
  if (!text) return null;

  return (
    <section className="border-b border-(--border) py-10">
      <div
        className={`grid grid-cols-1 gap-6 ${imageUrl ? "md:grid-cols-2" : ""} ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="label">Case Study</p>
          <h2 className="mt-2 font-headline text-[clamp(2.2rem,4.6vw,3.6rem)] leading-none">{title}</h2>
          <RichText content={text} className="mt-4 text-sm leading-8 text-(--text-sub)" />
        </div>
        {imageUrl && (
          <div>
            <div className="relative aspect-16/10 overflow-hidden border border-(--border)">
              <Image
                src={imageUrl}
                alt={`${title} visual`}
                fill
                unoptimized
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const [{ project, dbHealthy }, { previous, next }] = await Promise.all([
    getPublicProjectById(id),
    getProjectNeighbors(id),
  ]);

  if (!project) {
    notFound();
  }

  const heroGallery = project.galleryUrls?.[0];
  const storyImages = [
    project.galleryUrls?.[1],
    project.galleryUrls?.[2],
    project.galleryUrls?.[3],
  ];
  const storySections = [
    { title: "Challenge", text: project.challenge, image: storyImages[0] },
    { title: "Solution", text: project.solution, image: storyImages[1] },
    { title: "Outcome", text: project.outcome, image: storyImages[2] },
  ].filter((section) => Boolean(section.text));

  return (
    <main className="frame-shell pb-12">
      <Reveal className="py-12 sm:py-16">
        <Link className="btn" href="/projects">
          Back to Projects
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <header className="border-b border-(--border) pb-6">
              <p className="pill inline-block">{project.featured ? "Featured" : "Project"}</p>
              <h1 className="mt-3 font-headline text-[clamp(3rem,8vw,6rem)] leading-none">
                {project.title}
              </h1>
              {project.tags?.length > 0 && (
                <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-(--text-muted)">
                  {project.tags.join(" / ")}
                </p>
              )}
              <RichText
                content={project.description}
                className="mt-4 max-w-3xl text-sm leading-8 text-(--text-sub)"
              />
            </header>

            {(project.imageUrl || heroGallery) && (
              <section className="border-b border-(--border) py-8">
                <div className="relative aspect-video overflow-hidden border border-(--border)">
                  <Image
                    src={heroGallery || project.imageUrl}
                    alt={`${project.title} hero image`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </section>
            )}

            {storySections.map((section, index) => (
              <StoryBlock
                key={section.title}
                title={section.title}
                text={section.text}
                imageUrl={section.image}
                reverse={index % 2 === 1}
              />
            ))}

            {project.galleryUrls?.length > 0 && (
              <section className="py-8">
                <h2 className="font-headline text-[clamp(2.2rem,4.4vw,3.5rem)] leading-none">Gallery</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {project.galleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-16/10 overflow-hidden border border-(--border)">
                      <Image
                        src={url}
                        alt={`${project.title} gallery image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-(--border) pt-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {previous ? (
                  <Link className="card-soft p-4" href={`/projects/${previous._id}`}>
                    <p className="label">Previous Project</p>
                    <p className="mt-2 font-headline text-3xl leading-none">{previous.title}</p>
                  </Link>
                ) : (
                  <div className="card-soft p-4 opacity-60">
                    <p className="label">Previous Project</p>
                    <p className="mt-2 text-sm text-(--text-sub)">None</p>
                  </div>
                )}
                {next ? (
                  <Link className="card-soft p-4" href={`/projects/${next._id}`}>
                    <p className="label">Next Project</p>
                    <p className="mt-2 font-headline text-3xl leading-none">{next.title}</p>
                  </Link>
                ) : (
                  <div className="card-soft p-4 opacity-60">
                    <p className="label">Next Project</p>
                    <p className="mt-2 text-sm text-(--text-sub)">None</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-soft p-4">
              <p className="label">Project Meta</p>
              <div className="mt-4 space-y-4 text-sm uppercase tracking-[0.08em] text-(--text-sub)">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-(--text-muted)">Role</p>
                  <p className="mt-1">{project.role || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-(--text-muted)">Duration</p>
                  <p className="mt-1">{project.duration || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-(--text-muted)">Stack</p>
                  <p className="mt-1">{project.tags?.length ? project.tags.join(" / ") : "Not specified"}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                {project.liveUrl && (
                  <a className="btn text-center" href={project.liveUrl} target="_blank" rel="noreferrer">
                    Live Site
                  </a>
                )}
                {project.repoUrl && (
                  <a className="btn text-center" href={project.repoUrl} target="_blank" rel="noreferrer">
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>

        {!dbHealthy && (
          <p className="mt-6 border border-(--border) p-4 text-sm text-(--text-sub)">
            Data layer is currently unavailable. Some project details may be stale.
          </p>
        )}
      </Reveal>
    </main>
  );
}
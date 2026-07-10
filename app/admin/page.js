import Link from "next/link";
import { getSession } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Project from "@/app/models/Project";

async function getAdminProjects() {
	try {
		await connectDB();
		const projects = await Project.find({})
			.sort({ featured: -1, order: 1, createdAt: -1 })
			.lean();

		return {
			ok: true,
			projects: projects.map((project) => ({
				...project,
				_id: String(project._id),
			})),
		};
	} catch {
		return { ok: false, projects: [] };
	}
}

export default async function AdminPage({ searchParams }) {
	const session = await getSession();
	const params = await searchParams;

	if (!session) {
		return (
			<div className="p-6 sm:p-8">
				<p className="label">Authentication</p>
				<h2 className="font-headline mt-2 text-5xl leading-none sm:text-6xl">
					SIGN IN
				</h2>
				<p className="mt-4 max-w-lg text-sm leading-7 text-(--text-sub)">
					Admin is write-only and protected. Unauthenticated visitors can read
					the public portfolio but cannot access project controls.
				</p>
				{params?.error && (
					<p className="mt-4 text-sm text-(--text-sub)">
						Login failed. Check your credentials and retry.
					</p>
				)}
				<form action="/api/auth" method="post" className="mt-8 max-w-md space-y-4 card-soft p-4">
					{params?.next && <input type="hidden" name="next" value={params.next} />}
					<input
						className="input"
						name="username"
						type="text"
						placeholder="Admin username"
						required
					/>
					<input
						className="input"
						name="password"
						type="password"
						placeholder="Password"
						required
					/>
					<button className="btn w-full" type="submit">
						Login
					</button>
				</form>
			</div>
		);
	}

	const { ok, projects } = await getAdminProjects();
	const featured = projects.filter((project) => project.featured).length;
	const lastUpdated = projects[0]?.updatedAt
		? new Date(projects[0].updatedAt).toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
		  })
		: "-";

	return (
		<div>
			<section className="grid grid-cols-2 border-b border-(--border) md:grid-cols-4">
				<div className="border-r border-(--border) p-5 text-center">
					<span className="block font-headline text-5xl leading-none">{projects.length}</span>
					<span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
						Total Works
					</span>
				</div>
				<div className="border-r border-(--border) p-5 text-center">
					<span className="block font-headline text-5xl leading-none">{featured}</span>
					<span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
						Featured
					</span>
				</div>
				<div className="border-r border-(--border) p-5 text-center">
					<span className="block font-headline text-5xl leading-none">{session.username?.slice(0, 2)?.toUpperCase() || "AD"}</span>
					<span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
						Active User
					</span>
				</div>
				<div className="p-5 text-center">
					<span className="block font-headline text-5xl leading-none">{lastUpdated}</span>
					<span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
						Last Update
					</span>
				</div>
			</section>

			<section className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border) p-6 sm:p-8">
				<div>
					<p className="label">Session</p>
					<h2 className="font-headline mt-2 text-5xl leading-none sm:text-6xl">CONTROL PANEL</h2>
					<p className="mt-4 max-w-2xl text-sm leading-7 text-(--text-sub)">
						Signed in as {session.username}. This dashboard manages what the public
						portfolio renders.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Link className="btn" href="/admin/projects/new">
						New Project
					</Link>
					<form action="/api/auth" method="post">
						<input type="hidden" name="action" value="logout" />
						<button className="btn" type="submit">
							Logout
						</button>
					</form>
				</div>
			</section>

			<section>
				{!ok && (
					<div className="border-b border-(--border) p-6 text-sm text-(--text-sub) sm:p-8">
						Database is temporarily unavailable. Write actions are blocked until
						connectivity is restored.
					</div>
				)}

				<div className="grid grid-cols-1 gap-px bg-(--border) md:grid-cols-2 xl:grid-cols-3">
					{(projects.length ? projects : [{ _id: "empty" }]).map((project) => (
						<article key={project._id} className="bg-background p-6 sm:p-8">
							{project.title ? (
								<>
									<p className="pill inline-block">{project.featured ? "Featured" : "Standard"}</p>
									<h3 className="font-headline mt-3 text-4xl leading-none sm:text-5xl">
										{project.title}
									</h3>
									<p className="mt-4 text-sm text-(--text-sub) line-clamp-4">
										{project.description}
									</p>
									<div className="mt-6 flex flex-wrap gap-2">
										<Link className="btn" href={`/admin/projects/${project._id}`}>
											Edit Project
										</Link>
										{project.liveUrl && (
											<a className="btn" href={project.liveUrl} target="_blank" rel="noreferrer">
												Visit
											</a>
										)}
									</div>
								</>
							) : (
								<>
									<p className="label">No Content</p>
									<h3 className="font-headline mt-2 text-4xl leading-none sm:text-5xl">
										EMPTY STATE
									</h3>
									<p className="mt-4 text-sm text-(--text-sub)">
										Create your first project to populate the portfolio list.
									</p>
								</>
							)}
						</article>
					))}
				</div>
			</section>
		</div>
	);
}

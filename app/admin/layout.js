import Link from "next/link";

export default function AdminLayout({ children }) {
	return (
		<main className="frame-shell pb-12 pt-4 sm:pt-6">
			<div className="top-nav border border-(--border) bg-(--bg2) px-4 sm:px-6">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center border border-(--border) font-headline text-lg">
						JG
					</div>
					<div>
						<p className="text-[11px] uppercase tracking-[0.14em] text-(--text-muted)">
							Control Room
						</p>
						<h1 className="font-headline text-3xl leading-none">ADMIN PANEL</h1>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Link href="/admin" className="btn">
						Dashboard
					</Link>
					<Link href="/admin/projects/new" className="btn">
						Publish
					</Link>
				</div>
			</div>

			<section className="border-x border-b border-(--border) bg-background">
				{children}
			</section>
		</main>
	);
}
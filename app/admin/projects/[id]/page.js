"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

export default function EditProjectPage() {
	const params = useParams();
	const router = useRouter();
	const [form, setForm] = useState(null);
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let ignore = false;

		async function load() {
			try {
				const response = await fetch(`/api/projects/${params.id}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Unable to load project");
				}

				if (!ignore) {
					setForm({
						title: data.project.title || "",
						description: data.project.description || "",
						tags: (data.project.tags || []).join(", "),
						featured: Boolean(data.project.featured),
						imageUrl: data.project.imageUrl || "",
						imagePublicId: data.project.imagePublicId || "",
						liveUrl: data.project.liveUrl || "",
						repoUrl: data.project.repoUrl || "",
						order: data.project.order || 0,
					});
				}
			} catch (loadError) {
				if (!ignore) {
					setError(loadError.message || "Unable to load project");
				}
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		}

		load();

		return () => {
			ignore = true;
		};
	}, [params.id]);

	async function handleUpdate(event) {
		event.preventDefault();
		if (!form) return;

		setBusy(true);
		setError("");

		try {
			let imageUrl = form.imageUrl;
			let imagePublicId = form.imagePublicId;

			if (file) {
				const uploadData = new FormData();
				uploadData.append("file", file);

				const uploadRes = await fetch("/api/upload", {
					method: "POST",
					body: uploadData,
				});

				const uploadJson = await uploadRes.json();

				if (!uploadRes.ok) {
					throw new Error(uploadJson.error || "Upload failed");
				}

				imageUrl = uploadJson.imageUrl;
				imagePublicId = uploadJson.imagePublicId;
			}

			const response = await fetch(`/api/projects/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					tags: form.tags,
					order: Number(form.order || 0),
					imageUrl,
					imagePublicId,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Update failed");
			}

			setFile(null);

			router.push("/admin");
			router.refresh();
		} catch (updateError) {
			setError(updateError.message || "Update failed");
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete() {
		const confirmed = window.confirm("Delete this project permanently?");
		if (!confirmed) return;

		setBusy(true);
		setError("");

		try {
			const response = await fetch(`/api/projects/${params.id}`, {
				method: "DELETE",
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Delete failed");
			}

			router.push("/admin");
			router.refresh();
		} catch (deleteError) {
			setError(deleteError.message || "Delete failed");
		} finally {
			setBusy(false);
		}
	}

	if (loading) {
		return <div className="p-6 sm:p-8 text-sm text-(--text-sub)">Loading project...</div>;
	}

	if (!form) {
		return <div className="p-6 sm:p-8 text-sm text-(--text-sub)">{error || "Project unavailable"}</div>;
	}

	return (
		<section className="p-6 sm:p-8">
			<p className="label">Update Project</p>
			<h2 className="font-headline mt-2 text-4xl leading-none sm:text-5xl">
				EDIT ENTRY
			</h2>
			<form onSubmit={handleUpdate} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
				<input
					className="input"
					value={form.title}
					onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
					required
				/>
				<input
					className="input"
					type="number"
					value={form.order}
					onChange={(event) => setForm((prev) => ({ ...prev, order: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					rows={6}
					value={form.description}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, description: event.target.value }))
					}
					required
				/>
				<input
					className="input md:col-span-2"
					value={form.tags}
					onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
				/>
				<input
					className="input"
					value={form.liveUrl}
					onChange={(event) => setForm((prev) => ({ ...prev, liveUrl: event.target.value }))}
				/>
				<input
					className="input"
					value={form.repoUrl}
					onChange={(event) => setForm((prev) => ({ ...prev, repoUrl: event.target.value }))}
				/>
				<label className="grid-cell p-4 md:col-span-2">
					<span className="label block">Project image</span>
					<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
						{form.imageUrl ? (
							<div className="relative h-24 w-40 overflow-hidden border border-(--border)">
								<Image
									src={form.imageUrl}
									alt={`${form.title || "Project"} preview`}
									fill
									unoptimized
									className="object-cover"
								/>
							</div>
						) : (
							<p className="text-sm text-(--text-sub)">No image uploaded yet.</p>
						)}
						<input
							className="text-sm"
							type="file"
							accept="image/*"
							onChange={(event) => setFile(event.target.files?.[0] || null)}
						/>
					</div>
					<p className="mt-2 text-xs text-(--text-muted)">
						{file ? `Selected: ${file.name}` : "Choose a new image only if you want to replace the current one."}
					</p>
				</label>
				<label className="label md:col-span-2">
					<input
						className="mr-2"
						type="checkbox"
						checked={form.featured}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, featured: event.target.checked }))
						}
					/>
					Featured project
				</label>
				{error && (
					<p className="md:col-span-2 text-sm text-(--text-sub)">{error}</p>
				)}
				<button className="btn" type="submit" disabled={busy}>
					{busy ? "Saving..." : "Save Changes"}
				</button>
				<button className="btn" type="button" disabled={busy} onClick={handleDelete}>
					Delete Project
				</button>
			</form>
		</section>
	);
}
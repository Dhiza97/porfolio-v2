"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

export default function EditProjectPage() {
	const params = useParams();
	const router = useRouter();
	const [form, setForm] = useState(null);
	const [file, setFile] = useState(null);
	const [dragIndex, setDragIndex] = useState(null);
	const [galleryBusy, setGalleryBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const galleryItems = String(form?.galleryUrls || "")
		.split(/\n|,/)
		.map((url) => url.trim())
		.filter(Boolean);

	function setGalleryItems(nextItems) {
		setForm((prev) => ({
			...prev,
			galleryUrls: nextItems.join("\n"),
		}));
	}

	function moveGalleryItem(fromIndex, toIndex) {
		if (fromIndex === null || fromIndex === toIndex) return;
		if (fromIndex < 0 || toIndex < 0) return;
		if (fromIndex >= galleryItems.length || toIndex >= galleryItems.length) return;

		const next = [...galleryItems];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		setGalleryItems(next);
	}

	async function handleGalleryUploadSelection(event) {
		const files = Array.from(event.target.files || []);
		if (!files.length) return;

		setGalleryBusy(true);
		setError("");
		setSuccess("");

		try {
			const uploaded = await Promise.all(files.map((selectedFile) => uploadImage(selectedFile)));
			setGalleryItems([...galleryItems, ...uploaded.map((item) => item.imageUrl)]);
		} catch (uploadError) {
			setError(uploadError.message || "Unable to upload gallery images");
		} finally {
			setGalleryBusy(false);
			event.target.value = "";
		}
	}

	async function uploadImage(selectedFile) {
		const uploadData = new FormData();
		uploadData.append("file", selectedFile);

		const uploadRes = await fetch("/api/upload", {
			method: "POST",
			body: uploadData,
		});

		const uploadJson = await uploadRes.json();

		if (!uploadRes.ok) {
			throw new Error(uploadJson.error || "Upload failed");
		}

		return uploadJson;
	}

	useEffect(() => {
		let ignore = false;

		async function load() {
			try {
				const response = await fetch(`/api/projects/${params.id}`, {
					cache: "no-store",
				});
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Unable to load project");
				}

				if (!ignore) {
					setForm({
						title: data.project.title || "",
						description: data.project.description || "",
						role: data.project.role || "",
						duration: data.project.duration || "",
						challenge: data.project.challenge || "",
						solution: data.project.solution || "",
						outcome: data.project.outcome || "",
						tags: (data.project.tags || []).join(", "),
						galleryUrls: (data.project.galleryUrls || []).join("\n"),
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
		setSuccess("");

		try {
			let imageUrl = form.imageUrl;
			let imagePublicId = form.imagePublicId;

			if (file) {
				const uploadJson = await uploadImage(file);

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
			setSuccess("Project saved successfully. Redirecting...");
			await new Promise((resolve) => setTimeout(resolve, 700));

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
				<p className="md:col-span-2 text-xs text-(--text-muted)">
					Formatting is supported: use Markdown for lists, bold, and italics. Use HTML for underline, for example &lt;u&gt;text&lt;/u&gt;.
				</p>
				<input
					className="input md:col-span-2"
					value={form.tags}
					onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
				/>
				<input
					className="input"
					placeholder="Your role"
					value={form.role}
					onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
				/>
				<input
					className="input"
					placeholder="Duration"
					value={form.duration}
					onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					rows={4}
					placeholder="Challenge"
					value={form.challenge}
					onChange={(event) => setForm((prev) => ({ ...prev, challenge: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					rows={4}
					placeholder="Solution"
					value={form.solution}
					onChange={(event) => setForm((prev) => ({ ...prev, solution: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					rows={4}
					placeholder="Outcome"
					value={form.outcome}
					onChange={(event) => setForm((prev) => ({ ...prev, outcome: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					rows={4}
					placeholder="Gallery image URLs (one per line)"
					value={form.galleryUrls}
					onChange={(event) => setForm((prev) => ({ ...prev, galleryUrls: event.target.value }))}
				/>
				<label className="grid-cell p-4 md:col-span-2">
					<span className="label block">Gallery image uploads</span>
					<input
						className="mt-2"
						type="file"
						accept="image/*"
						multiple
						onChange={handleGalleryUploadSelection}
					/>
					<p className="mt-2 text-xs text-(--text-muted)">
						{galleryBusy
							? "Uploading gallery images..."
							: "Optional: select multiple images to upload and append to the gallery."}
					</p>
				</label>
				{galleryItems.length > 0 && (
					<div className="md:col-span-2">
						<p className="label mb-2">Gallery order (drag to reorder)</p>
						<ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
							{galleryItems.map((url, index) => (
								<li
									key={`${url}-${index}`}
									draggable
									onDragStart={() => setDragIndex(index)}
									onDragOver={(event) => event.preventDefault()}
									onDrop={() => {
										moveGalleryItem(dragIndex, index);
										setDragIndex(null);
									}}
									className="card-soft overflow-hidden"
								>
									<div className="aspect-square bg-(--bg3)">
										<img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
									</div>
									<div className="flex items-center justify-between border-t border-(--border) p-2 text-[10px] uppercase tracking-[0.12em] text-(--text-muted)">
										<span>{index + 1}</span>
										<div className="flex gap-1">
											<button
												type="button"
												className="btn px-2 py-1 text-[10px]"
												onClick={() => moveGalleryItem(index, Math.max(0, index - 1))}
											>
												Up
											</button>
											<button
												type="button"
												className="btn px-2 py-1 text-[10px]"
												onClick={() => moveGalleryItem(index, Math.min(galleryItems.length - 1, index + 1))}
											>
												Down
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
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
				{success && (
					<p className="md:col-span-2 text-sm text-(--text-sub)">{success}</p>
				)}
				<button className="btn" type="submit" disabled={busy || galleryBusy}>
					{busy ? "Saving..." : "Save Changes"}
				</button>
				<button className="btn" type="button" disabled={busy} onClick={handleDelete}>
					Delete Project
				</button>
			</form>
		</section>
	);
}
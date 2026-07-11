"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
	title: "",
	description: "",
	role: "",
	duration: "",
	challenge: "",
	solution: "",
	outcome: "",
	tags: "",
	galleryUrls: "",
	featured: false,
	liveUrl: "",
	repoUrl: "",
	order: 0,
};

export default function NewProjectPage() {
	const router = useRouter();
	const [form, setForm] = useState(initialState);
	const [file, setFile] = useState(null);
	const [dragIndex, setDragIndex] = useState(null);
	const [galleryBusy, setGalleryBusy] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const galleryItems = String(form.galleryUrls || "")
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

	async function handleSubmit(event) {
		event.preventDefault();

		if (!file) {
			setError("Select an image before creating a project.");
			return;
		}

		setBusy(true);
		setError("");
		setSuccess("");

		try {
			const uploadJson = await uploadImage(file);

			const createRes = await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					order: Number(form.order || 0),
					tags: form.tags,
					imageUrl: uploadJson.imageUrl,
					imagePublicId: uploadJson.imagePublicId,
				}),
			});

			const createJson = await createRes.json();

			if (!createRes.ok) {
				throw new Error(createJson.error || "Project creation failed");
			}
			setSuccess("Project saved successfully. Redirecting...");
			await new Promise((resolve) => setTimeout(resolve, 700));

			router.push("/admin");
			router.refresh();
		} catch (submissionError) {
			setError(submissionError.message || "Unable to create project");
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className="p-6 sm:p-8">
			<p className="label">Create Project</p>
			<h2 className="font-headline mt-2 text-4xl leading-none sm:text-5xl">
				NEW ENTRY
			</h2>
			<form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
				<input
					className="input"
					placeholder="Project title"
					value={form.title}
					onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
					required
				/>
				<input
					className="input"
					placeholder="Order"
					type="number"
					value={form.order}
					onChange={(event) => setForm((prev) => ({ ...prev, order: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					placeholder="Project description"
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
					placeholder="Tags (comma separated)"
					value={form.tags}
					onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
				/>
				<input
					className="input"
					placeholder="Your role (e.g. Full-stack Engineer)"
					value={form.role}
					onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
				/>
				<input
					className="input"
					placeholder="Duration (e.g. 6 weeks)"
					value={form.duration}
					onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					placeholder="Challenge"
					rows={4}
					value={form.challenge}
					onChange={(event) => setForm((prev) => ({ ...prev, challenge: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					placeholder="Solution"
					rows={4}
					value={form.solution}
					onChange={(event) => setForm((prev) => ({ ...prev, solution: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					placeholder="Outcome"
					rows={4}
					value={form.outcome}
					onChange={(event) => setForm((prev) => ({ ...prev, outcome: event.target.value }))}
				/>
				<textarea
					className="input md:col-span-2"
					placeholder="Gallery image URLs (one per line)"
					rows={4}
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
					placeholder="Live URL"
					value={form.liveUrl}
					onChange={(event) => setForm((prev) => ({ ...prev, liveUrl: event.target.value }))}
				/>
				<input
					className="input"
					placeholder="Repository URL"
					value={form.repoUrl}
					onChange={(event) => setForm((prev) => ({ ...prev, repoUrl: event.target.value }))}
				/>
				<label className="grid-cell p-4 md:col-span-2">
					<span className="label block">Project image</span>
					<input
						className="mt-2"
						type="file"
						accept="image/*"
						onChange={(event) => setFile(event.target.files?.[0] || null)}
						required
					/>
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
				<button className="btn md:col-span-2" disabled={busy || galleryBusy} type="submit">
					{busy ? "Saving..." : "Create Project"}
				</button>
			</form>
		</section>
	);
}
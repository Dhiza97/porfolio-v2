"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
	title: "",
	description: "",
	tags: "",
	featured: false,
	liveUrl: "",
	repoUrl: "",
	order: 0,
};

export default function NewProjectPage() {
	const router = useRouter();
	const [form, setForm] = useState(initialState);
	const [file, setFile] = useState(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(event) {
		event.preventDefault();

		if (!file) {
			setError("Select an image before creating a project.");
			return;
		}

		setBusy(true);
		setError("");

		try {
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
				<input
					className="input md:col-span-2"
					placeholder="Tags (comma separated)"
					value={form.tags}
					onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
				/>
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
					<p className="md:col-span-2 text-sm text-[var(--text-sub)]">{error}</p>
				)}
				<button className="btn md:col-span-2" disabled={busy} type="submit">
					{busy ? "Saving..." : "Create Project"}
				</button>
			</form>
		</section>
	);
}

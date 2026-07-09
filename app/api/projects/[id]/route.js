import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import { getCloudinary } from "@/app/lib/cloudinary";
import { connectDB } from "@/app/lib/db";
import Project from "@/app/models/Project";

const updateSchema = z
	.object({
		title: z.string().trim().min(2).max(100).optional(),
		description: z.string().trim().min(12).max(1000).optional(),
		tags: z.array(z.string().trim().min(1).max(24)).max(12).optional(),
		featured: z.boolean().optional(),
		imageUrl: z.string().url().optional(),
		imagePublicId: z.string().trim().min(4).optional(),
		liveUrl: z.string().url().optional().or(z.literal("")),
		repoUrl: z.string().url().optional().or(z.literal("")),
		order: z.number().int().min(0).optional(),
	})
	.refine((payload) => Object.keys(payload).length > 0, {
		message: "No fields supplied for update",
	});

function requireAdmin(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = token ? verifyToken(token) : null;

	if (!session || session.role !== "admin") {
		return null;
	}

	return session;
}

function validateObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request, { params }) {
	const { id } = await params;

	if (!validateObjectId(id)) {
		return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
	}

	try {
		await connectDB();
		const project = await Project.findById(id).lean();

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		return NextResponse.json(
			{
				ok: true,
				project: {
					...project,
					_id: String(project._id),
				},
			},
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch project" },
			{ status: 500 },
		);
	}
}

export async function PUT(request, { params }) {
	const session = requireAdmin(request);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	if (!validateObjectId(id)) {
		return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
	}

	try {
		const body = await request.json();
		const parsed = updateSchema.safeParse({
			...body,
			tags:
				body?.tags === undefined
					? undefined
					: Array.isArray(body.tags)
						? body.tags
						: String(body.tags || "")
								.split(",")
								.map((tag) => tag.trim())
								.filter(Boolean),
			featured:
				body?.featured === undefined ? undefined : Boolean(body.featured),
			order: body?.order === undefined ? undefined : Number(body.order),
		});

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid update payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		await connectDB();
		const existing = await Project.findById(id).lean();

		if (!existing) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		const updated = await Project.findByIdAndUpdate(
			id,
			{
				...parsed.data,
				liveUrl: parsed.data.liveUrl || undefined,
				repoUrl: parsed.data.repoUrl || undefined,
			},
			{ new: true, runValidators: true },
		).lean();

		if (!updated) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		if (
			existing.imagePublicId &&
			parsed.data.imagePublicId &&
			existing.imagePublicId !== parsed.data.imagePublicId
		) {
			try {
				const cloudinary = getCloudinary();
				await cloudinary.uploader.destroy(existing.imagePublicId);
			} catch {
				// Best-effort cleanup; update should remain successful even if media cleanup fails.
			}
		}

		return NextResponse.json(
			{
				ok: true,
				project: {
					...updated,
					_id: String(updated._id),
				},
			},
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ error: "Failed to update project" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request, { params }) {
	const session = requireAdmin(request);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	if (!validateObjectId(id)) {
		return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
	}

	try {
		await connectDB();
		const project = await Project.findById(id);

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		const publicId = project.imagePublicId;

		await project.deleteOne();

		if (publicId) {
			try {
				const cloudinary = getCloudinary();
				await cloudinary.uploader.destroy(publicId);
			} catch {
				// Best-effort cleanup only; deleted DB record should not be restored on media failure.
			}
		}

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to delete project" },
			{ status: 500 },
		);
	}
}

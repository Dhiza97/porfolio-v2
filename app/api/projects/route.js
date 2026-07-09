import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Project from "@/app/models/Project";

const projectSchema = z.object({
	title: z.string().trim().min(2).max(100),
	description: z.string().trim().min(12).max(1000),
	tags: z.array(z.string().trim().min(1).max(24)).max(12).default([]),
	featured: z.boolean().optional().default(false),
	imageUrl: z.string().url(),
	imagePublicId: z.string().trim().min(4),
	liveUrl: z.string().url().optional().or(z.literal("")),
	repoUrl: z.string().url().optional().or(z.literal("")),
	order: z.number().int().min(0).optional().default(0),
});

function requireAdmin(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = token ? verifyToken(token) : null;

	if (!session || session.role !== "admin") {
		return null;
	}

	return session;
}

export async function GET() {
	try {
		await connectDB();
		const projects = await Project.find({})
			.sort({ featured: -1, order: 1, createdAt: -1 })
			.lean();

		return NextResponse.json(
			{
				ok: true,
				projects: projects.map((project) => ({
					...project,
					_id: String(project._id),
				})),
			},
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{
				ok: false,
				unavailable: true,
				projects: [],
				error: "Project store is temporarily unavailable",
			},
			{ status: 200 },
		);
	}
}

export async function POST(request) {
	const session = requireAdmin(request);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = projectSchema.safeParse({
			...body,
			tags: Array.isArray(body?.tags)
				? body.tags
				: String(body?.tags || "")
						.split(",")
						.map((tag) => tag.trim())
						.filter(Boolean),
			featured: Boolean(body?.featured),
			order: Number(body?.order || 0),
		});

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid project payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		await connectDB();
		const project = await Project.create({
			...parsed.data,
			liveUrl: parsed.data.liveUrl || undefined,
			repoUrl: parsed.data.repoUrl || undefined,
		});

		return NextResponse.json(
			{
				ok: true,
				project: {
					...project.toObject(),
					_id: String(project._id),
				},
			},
			{ status: 201 },
		);
	} catch {
		return NextResponse.json(
			{ error: "Failed to create project" },
			{ status: 500 },
		);
	}
}

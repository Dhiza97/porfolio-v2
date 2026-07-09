import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import { getCloudinary } from "@/app/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function requireAdmin(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = token ? verifyToken(token) : null;

	if (!session || session.role !== "admin") {
		return null;
	}

	return session;
}

export async function POST(request) {
	const session = requireAdmin(request);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!(file instanceof File)) {
			return NextResponse.json({ error: "No file received" }, { status: 400 });
		}

		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image uploads are supported" },
				{ status: 400 },
			);
		}

		if (file.size > MAX_IMAGE_SIZE) {
			return NextResponse.json(
				{ error: "Image exceeds 5MB size limit" },
				{ status: 400 },
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");
		const dataUri = `data:${file.type};base64,${base64}`;

		const cloudinary = getCloudinary();
		const upload = await cloudinary.uploader.upload(dataUri, {
			folder: "portfolio-v2/projects",
			resource_type: "image",
		});

		return NextResponse.json(
			{
				ok: true,
				imageUrl: upload.secure_url,
				imagePublicId: upload.public_id,
			},
			{ status: 201 },
		);
	} catch {
		return NextResponse.json(
			{ error: "Image upload failed" },
			{ status: 502 },
		);
	}
}

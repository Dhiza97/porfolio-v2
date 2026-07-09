import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
	clearSessionCookie,
	createSessionCookie,
	getSession,
	signToken,
} from "@/app/lib/auth";

function wantsHtml(request) {
	const accept = request.headers.get("accept") || "";
	return accept.includes("text/html");
}

function unauthorizedResponse(request, message) {
	if (wantsHtml(request)) {
		const url = new URL("/admin?error=invalid_credentials", request.url);
		return NextResponse.redirect(url);
	}

	return NextResponse.json({ error: message }, { status: 401 });
}

export async function GET() {
	const session = await getSession();
	return NextResponse.json({ authenticated: Boolean(session), session });
}

export async function POST(request) {
	const contentType = request.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const body = await request.json();

		if (body?.action === "logout") {
			return NextResponse.json(
				{ ok: true },
				{
					headers: {
						"Set-Cookie": clearSessionCookie(),
					},
				},
			);
		}

		const username = body?.username || "";
		const password = body?.password || "";

		const adminUsername = process.env.ADMIN_USERNAME;
		const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

		if (!adminUsername || !adminPasswordHash) {
			return NextResponse.json(
				{ error: "Admin credentials are not configured" },
				{ status: 500 },
			);
		}

		const validUser = username === adminUsername;
		const validPass = await bcrypt.compare(password, adminPasswordHash);

		if (!validUser || !validPass) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const token = signToken({ role: "admin", username: adminUsername });

		return NextResponse.json(
			{ ok: true },
			{
				headers: {
					"Set-Cookie": createSessionCookie(token),
				},
			},
		);
	}

	const formData = await request.formData();
	const action = formData.get("action");

	if (action === "logout") {
		return NextResponse.redirect(new URL("/admin", request.url), {
			headers: {
				"Set-Cookie": clearSessionCookie(),
			},
		});
	}

	const username = String(formData.get("username") || "").trim();
	const password = String(formData.get("password") || "");

	const adminUsername = process.env.ADMIN_USERNAME;
	const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

	if (!adminUsername || !adminPasswordHash) {
		return NextResponse.json(
			{ error: "Admin credentials are not configured" },
			{ status: 500 },
		);
	}

	const validUser = username === adminUsername;
	const validPass = await bcrypt.compare(password, adminPasswordHash);

	if (!validUser || !validPass) {
		return unauthorizedResponse(request, "Invalid credentials");
	}

	const token = signToken({ role: "admin", username: adminUsername });

	return NextResponse.redirect(new URL("/admin", request.url), {
		headers: {
			"Set-Cookie": createSessionCookie(token),
		},
	});
}

export async function DELETE() {
	return NextResponse.json(
		{ ok: true },
		{
			headers: {
				"Set-Cookie": clearSessionCookie(),
			},
		},
	);
}

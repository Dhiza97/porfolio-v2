import { NextResponse } from "next/server";

const COOKIE_NAME = "the_token";

export function middleware(request) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const isAuthed = Boolean(token);

	if (pathname.startsWith("/admin/projects")) {
		if (!isAuthed) {
			const loginUrl = new URL("/admin", request.url);
			loginUrl.searchParams.set("next", pathname);
			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.next();
	}

	if (pathname.startsWith("/api/upload")) {
		if (!isAuthed) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		return NextResponse.next();
	}

	if (pathname.startsWith("/api/projects")) {
		if (request.method === "GET") {
			return NextResponse.next();
		}

		if (!isAuthed) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/projects/:path*", "/api/projects/:path*", "/api/upload/:path*"],
};

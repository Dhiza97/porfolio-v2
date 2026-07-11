import { NextResponse } from "next/server";
import sharp from "sharp";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import { getCloudinary } from "@/app/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CARD_RADIUS_MIN = 40;
const CARD_RADIUS_MAX = 48;
const MIN_CANVAS_WIDTH = 1200;
const MIN_CANVAS_HEIGHT = 900;

function requireAdmin(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = token ? verifyToken(token) : null;

	if (!session || session.role !== "admin") {
		return null;
	}

	return session;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function colorRgb(color) {
	return `${color.r}, ${color.g}, ${color.b}`;
}

async function sampleColor(inputBuffer, left, top, width, height) {
	const [r, g, b] = await sharp(inputBuffer)
		.extract({ left, top, width, height })
		.resize(1, 1)
		.raw()
		.toBuffer();

	return { r, g, b };
}

async function getPalette(inputBuffer, imageWidth, imageHeight) {
	const thirdW = Math.max(1, Math.floor(imageWidth / 3));
	const thirdH = Math.max(1, Math.floor(imageHeight / 3));

	const topLeft = await sampleColor(inputBuffer, 0, 0, thirdW, thirdH);
	const center = await sampleColor(
		inputBuffer,
		Math.max(0, Math.floor((imageWidth - thirdW) / 2)),
		Math.max(0, Math.floor((imageHeight - thirdH) / 2)),
		thirdW,
		thirdH,
	);
	const bottomRight = await sampleColor(
		inputBuffer,
		Math.max(0, imageWidth - thirdW),
		Math.max(0, imageHeight - thirdH),
		thirdW,
		thirdH,
	);

	return [topLeft, center, bottomRight];
}

function gradientSvg(width, height, palette) {
	const [a, b, c] = palette;

	return Buffer.from(`
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="rgb(${colorRgb(a)})" stop-opacity="0.92" />
					<stop offset="55%" stop-color="rgb(${colorRgb(b)})" stop-opacity="0.86" />
					<stop offset="100%" stop-color="rgb(${colorRgb(c)})" stop-opacity="0.9" />
				</linearGradient>
			</defs>
			<rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />
		</svg>
	`);
}

function glowSvg(width, height, cardX, cardY, cardW, cardH, palette) {
	const [a, b, c] = palette;
	const glowA = Math.round(cardX + cardW * 0.14);
	const glowB = Math.round(cardX + cardW * 0.82);
	const glowY = Math.round(cardY + cardH * 0.7);

	return Buffer.from(`
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="blur" x="-100%" y="-100%" width="300%" height="300%">
					<feGaussianBlur stdDeviation="65" />
				</filter>
			</defs>
			<g filter="url(#blur)">
				<circle cx="${glowA}" cy="${glowY}" r="120" fill="rgba(${colorRgb(a)},0.35)" />
				<circle cx="${glowB}" cy="${Math.round(glowY - cardH * 0.24)}" r="130" fill="rgba(${colorRgb(c)},0.34)" />
				<circle cx="${Math.round(cardX + cardW * 0.5)}" cy="${Math.round(glowY - cardH * 0.08)}" r="140" fill="rgba(${colorRgb(b)},0.28)" />
			</g>
		</svg>
	`);
}

function shadowSvg(width, height, cardX, cardY, cardW, cardH, radius) {
	return Buffer.from(`
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="shadow" x="-40%" y="-40%" width="180%" height="220%">
					<feDropShadow dx="0" dy="26" stdDeviation="24" flood-color="rgba(0,0,0,0.34)" />
				</filter>
			</defs>
			<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="white" opacity="0.02" filter="url(#shadow)" />
		</svg>
	`);
}

function borderSvg(width, height, cardX, cardY, cardW, cardH, radius) {
	return Buffer.from(`
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="${radius}" ry="${radius}" fill="none" stroke="rgba(255,255,255,0.38)" stroke-width="1" />
		</svg>
	`);
}

async function frameScreenshot(inputBuffer) {
	const metadata = await sharp(inputBuffer).metadata();

	if (!metadata.width || !metadata.height) {
		throw new Error("Unable to read image metadata");
	}

	const screenshotW = metadata.width;
	const screenshotH = metadata.height;
	const padX = clamp(Math.round(screenshotW * 0.14), 110, 220);
	const padY = clamp(Math.round(screenshotH * 0.16), 100, 200);
	const canvasW = Math.max(MIN_CANVAS_WIDTH, screenshotW + padX * 2);
	const canvasH = Math.max(MIN_CANVAS_HEIGHT, screenshotH + padY * 2);
	const cardX = Math.round((canvasW - screenshotW) / 2);
	const cardY = Math.round((canvasH - screenshotH) / 2);
	const radius = clamp(Math.round(Math.min(screenshotW, screenshotH) * 0.045), CARD_RADIUS_MIN, CARD_RADIUS_MAX);

	const palette = await getPalette(inputBuffer, screenshotW, screenshotH);

	const roundedMask = Buffer.from(`
		<svg width="${screenshotW}" height="${screenshotH}" viewBox="0 0 ${screenshotW} ${screenshotH}" xmlns="http://www.w3.org/2000/svg">
			<rect x="0" y="0" width="${screenshotW}" height="${screenshotH}" rx="${radius}" ry="${radius}" fill="white" />
		</svg>
	`);

	const roundedScreenshot = await sharp(inputBuffer)
		.png()
		.composite([{ input: roundedMask, blend: "dest-in" }])
		.toBuffer();

	return sharp({
		create: {
			width: canvasW,
			height: canvasH,
			channels: 4,
			background: "#101010",
		},
	})
		.composite([
			{ input: gradientSvg(canvasW, canvasH, palette) },
			{ input: glowSvg(canvasW, canvasH, cardX, cardY, screenshotW, screenshotH, palette) },
			{ input: shadowSvg(canvasW, canvasH, cardX, cardY, screenshotW, screenshotH, radius) },
			{ input: roundedScreenshot, left: cardX, top: cardY },
			{ input: borderSvg(canvasW, canvasH, cardX, cardY, screenshotW, screenshotH, radius) },
		])
		.jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
		.toBuffer();
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
		const framedBuffer = await frameScreenshot(Buffer.from(arrayBuffer));
		const dataUri = `data:image/jpeg;base64,${framedBuffer.toString("base64")}`;

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

# Portfolio v2

Personal portfolio and admin CMS built with Next.js App Router, MongoDB, and Cloudinary.

## Highlights

- Public portfolio with project listing and project detail storytelling pages.
- Admin dashboard to create, edit, and manage projects.
- JWT cookie authentication for admin-only routes.
- Cloudinary image uploads.
- Automatic screenshot framing pipeline on upload (gradient background, glow, floating rounded card).
- Framer Motion based transitions with reduced-motion support.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- MongoDB + Mongoose
- Cloudinary
- Zod
- Framer Motion
- Sharp

## Environment Variables

Create a .env.local file in the project root:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hash

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
CONTACT_TO_EMAIL=your_inbox_email
CONTACT_FROM_EMAIL=no-reply@yourdomain.com
```

Notes:

- ADMIN_PASSWORD_HASH must be a bcrypt hash, not plain text.
- For production, ensure env values are set in your host dashboard and redeploy.

## Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Run built app
npm run lint   # Run ESLint
```

## Authentication Flow

- Admin login page: /admin
- Auth endpoint: /api/auth
- Session cookie: the_token (httpOnly, sameSite strict)
- Middleware protects admin/project mutation/upload routes.

## Contact Form

- Public contact page: /contact
- Form endpoint: /api/contact
- Delivery method: SMTP via Nodemailer
- On success/error, form redirects back to /contact with status feedback.

## Image Upload Pipeline

Uploads sent through /api/upload are post-processed server-side before Cloudinary storage:

- Validates file type and max size (5 MB).
- Samples colors from the screenshot.
- Builds a presentation canvas with gradient and soft glow.
- Keeps screenshot pixels intact inside a rounded floating card.
- Exports optimized JPEG and uploads to Cloudinary.

## Project Structure

```text
app/
	admin/                 # Admin dashboard and project editor
	api/
		auth/                # Login/logout route
		contact/             # Contact form email route
		projects/            # Project CRUD routes
		upload/              # Image upload + framing pipeline
	projects/
		[id]/                # Public project detail page
	components/
		admin/               # Admin UI components
		portfolio/           # Public site components
	lib/                   # DB, auth, Cloudinary helpers
	models/                # Mongoose models
public/                  # Static assets
```

## Deployment Checklist

- Set all required environment variables.
- Confirm MongoDB and Cloudinary credentials.
- Build once locally with npm run build.
- Deploy and verify:
	- /projects data renders
	- /admin login works
	- image upload succeeds

## Troubleshooting

### Admin login fails in production

- Verify ADMIN_USERNAME matches exactly (case-sensitive).
- Verify ADMIN_PASSWORD_HASH is a valid bcrypt hash and not wrapped in quotes.
- Ensure JWT_SECRET is set in production.
- Redeploy after changing environment variables.

### Login redirects but you are still unauthenticated

- Confirm your deployment is served over HTTPS so secure cookies can be set.
- Check that system time on server and client is correct (JWT validation depends on time).
- Clear site cookies and retry login.

### Projects are not loading

- Confirm MONGODB_URI is present and reachable from your host.
- Check database allowlist/network access for your deployment provider.
- Verify collection data exists in the target environment.

### Image upload fails

- Confirm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.
- Ensure uploaded file is an image and smaller than 5 MB.
- If failures start after dependency changes, reinstall modules and rebuild.

### Contact form does not send email

- Confirm SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are valid.
- Ensure CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL are set.
- Check your SMTP provider requires app passwords or verified sender addresses.

### Dev server exits immediately

- Run npm install to refresh dependencies.
- Run npm run build to surface compile-time errors.
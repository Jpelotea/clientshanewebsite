# Technical Architecture

## Rendering and deployment

Astro generates a static site with minimal client-side JavaScript. Netlify serves `dist/` and routes `/api/forms/:formType` to a Netlify Function. Pull requests and branches may receive deploy previews; the main branch is the intended production branch only after explicit approval.

## Component and route architecture

- Global layout, SEO, consent, disclosure, breadcrumb, media-placeholder, button, and container components
- Responsive header/mobile navigation and footer
- Reusable page heroes, call-to-action sections, and card components
- Three purpose-specific forms with shared progressive enhancement and status handling
- Base and article layouts
- Eighteen required static route types plus dynamic Insights article routes

## Content model

Astro Content Collections contain articles, testimonials/team stories, leaders, events, achievements, and resources. JSON files provide selected homepage content and FAQs. Content has explicit workflow status. Public collection queries show only approved content unless a controlled review build enables drafts.

## CMS

Decap CMS uses the GitHub backend for `Jpelotea/clientshanewebsite`, publishes to `main`, and enables editorial workflow. It manages approved structured content and selected text, not application code or secure data. Authentication uses a GitHub OAuth application and the connected Netlify OAuth provider; no credentials are committed.

## Forms

One function validates origin, request type and size, honeypot, Turnstile, form fields, and form-specific behavior. Netlify's function-level rate-limit configuration covers `/api/forms/:formType` using platform domain and IP aggregation. The application does not implement unreliable process-memory rate limiting.

## Resume upload

The runtime selects exactly one provider through `RESUME_STORAGE_PROVIDER`: AWS S3 or Cloudflare R2. AWS S3 is the recommended initial deployment. Files are limited to 4 MB and PDF/DOC/DOCX, checked by extension, MIME, and signature, then stored privately using randomized keys. Recipients receive a signed bearer link valid for no more than 24 hours. A bucket lifecycle rule must enforce deletion.

## Notification architecture

Resend sends sanitized HTML and plain-text notifications after successful validation and storage. Résumés are never attachments. Failed notification after upload triggers best-effort object deletion and a non-success response.

## Consent and analytics

The site starts with analytics and marketing consent denied. Google Analytics and Meta Pixel load only after the corresponding visitor consent and only when IDs are configured. Visitors can reopen settings and withdraw consent. Missing IDs do not block site operation.

## SEO and launch controls

`PUBLIC_SITE_READY=false` forces noindex on every page and generates a disallow-all `robots.txt` without sitemap advertising. Sitemap generation occurs only for a ready build. `PUBLIC_PROFILE_CLAIMS_VERIFIED=false` keeps unverified professional claims out of Person structured data. The built-output audit blocks ready builds that still contain known placeholder markers.

## Security controls

- HTTPS/HSTS and response security headers on Netlify
- Content Security Policy including only required service origins
- Same-origin/additional-origin allowlist
- Mandatory server-side Turnstile verification
- Platform rate limiting
- Server validation and non-sensitive error responses
- Private object storage and short-lived links
- No hard-coded secrets or personal data in Git
- CMS authorization through GitHub OAuth
- Separate preview/staging/production environment values

## Validation architecture

- Source/configuration audit: `scripts/validate_project.py`
- Unit tests: Vitest
- Astro/TypeScript check: `astro check`
- Static production build: `astro build`
- Built-output route/link/SEO/noindex audit: `scripts/audit_dist.py`
- Netlify local route/function smoke test: `scripts/netlify_smoke.sh`
- GitHub Actions executes the connected toolchain on pushes and pull requests

## Future integration hooks

The separation between content, presentation, forms, and runtime services allows future calendar, CRM, applicant pipeline, email automation, chatbot, event registration, expanded team directory, multilingual content, and custom-domain work without replacing the core architecture.

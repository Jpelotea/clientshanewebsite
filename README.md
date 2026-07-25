# Shane Perez — Personal Brand Website

A controlled-review Astro website implementing the approved **Shane Perez — Builder of Builders** blueprint. It balances personal brand and leadership, recruitment and career opportunities, and financial education and consultation.

> **Current status: Not Ready for Staging.** The complete source, genuine npm lockfile, tests, Astro checks, production build, built-output audit, and credential-free Netlify local smoke test pass in GitHub Actions. Protected staging and credential-dependent Turnstile, Resend, AWS S3, and Decap CMS OAuth tests remain pending. Keep `PUBLIC_SITE_READY=false`.

## Canonical repository

- Repository: `Jpelotea/clientshanewebsite`
- Default branch: `main`
- Working branch: `chore/technical-validation-and-staging`
- Draft pull request: `#1`
- Production deployment: not authorized

Do not force-push shared history, merge the draft pull request, enable indexing, or commit credentials, applicant data, résumés, private media, or form submissions.

## Technology

- Astro static site and TypeScript
- Netlify hosting and Netlify Functions
- Decap CMS with GitHub backend and editorial workflow
- Cloudflare Turnstile
- Resend notifications
- One private S3-compatible résumé-storage provider
- Consent-gated Google Analytics and Meta Pixel
- Vitest, source validation, built-output auditing, and GitHub Actions

## Requirements

- Node.js 22 LTS
- npm 10 or 11
- Python 3.12 with `requirements-dev.txt`
- Netlify CLI through the committed npm lockfile

## Local setup

```bash
cp .env.example .env
npm ci --no-audit --no-fund
python -m pip install --requirement requirements-dev.txt
npm run validate:source
npm test
npm run check
npm run build
npm run netlify:smoke
```

Use isolated test credentials and synthetic data only. Do not use live applicant information during development or staging validation.

## Validation commands

```bash
npm run validate:source   # project-owned structured files, routes, and links
npm test                  # form schemas, HTTP helpers, Turnstile, and upload checks
npm run check             # Astro and TypeScript checks
npm run build             # check, static build, and built-output audit
npm run netlify:smoke     # local Netlify static/function smoke test
npm run validate          # source validation, tests, and production build
```

The latest fully successful GitHub Actions validation run is documented in `VALIDATION_REPORT.md`.

## Launch controls

- `PUBLIC_SITE_READY=false` forces page-level `noindex` and a disallow-all robots policy.
- `PUBLIC_PROFILE_CLAIMS_VERIFIED=false` prevents unverified professional claims from entering Person structured data.
- Draft content stays hidden unless `PUBLIC_SHOW_DRAFT_CONTENT=true` in a controlled review environment.
- The build audit blocks ready-for-indexing output that still contains known placeholders or verification markers.
- All Netlify contexts intentionally keep `PUBLIC_SITE_READY=false`; production readiness requires a separate reviewed change and explicit authorization.

## Security and privacy

- Real `.env` files, credentials, résumés, submissions, private photographs, and compliance documents must never enter the public repository.
- Résumés are stored in one configured private external bucket and shared only through short-lived signed links—not email attachments.
- A provider lifecycle deletion rule is mandatory.
- Public forms require same-origin/allowlisted requests, server validation, Turnstile, and Netlify platform rate limiting.
- Staging forms must remain unavailable until isolated test credentials are configured.

## Documentation

- `BLUEPRINT_REVIEW.md`
- `IMPLEMENTATION_AUDIT.md`
- `TECHNICAL_ARCHITECTURE.md`
- `ENVIRONMENT_CONFIGURATION.md`
- `FORM_UPLOAD_ARCHITECTURE.md`
- `CONTENT_EDITOR_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`
- `TESTING_CHECKLIST.md`
- `LAUNCH_CHECKLIST.md`
- `REMAINING_REQUIREMENTS.md`
- `VALIDATION_REPORT.md`

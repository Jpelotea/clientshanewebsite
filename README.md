# Shane Perez - Personal Brand Website

A controlled-review Astro website implementing the approved **Shane Perez - Builder of Builders** blueprint. The project balances personal brand and leadership, recruitment and career opportunities, and financial education and consultation.

> Current status: technical-validation branch. The website is not approved for production publication, and `PUBLIC_SITE_READY` must remain `false` until the launch checklist is complete.

## Canonical repository

- Repository: `Jpelotea/clientshanewebsite`
- Default branch: `main`
- Validation branch: `chore/technical-validation-and-staging`
- Netlify deployment branch: `main` after explicit production approval

Major corrections must be made on a working branch and reviewed through a pull request. Do not force-push shared history or commit credentials, applicant data, private media, or form submissions.

## Technology

- Astro static site and TypeScript
- Netlify hosting and Netlify Functions
- Decap CMS with GitHub backend and editorial workflow
- Cloudflare Turnstile
- Resend notifications
- One private S3-compatible résumé-storage provider
- Consent-gated Google Analytics and Meta Pixel
- Vitest and repository/build audits

## Requirements

- Node.js 22 LTS for development, CI, and Netlify builds
- npm; generate and commit `package-lock.json` during the first connected validation, then use `npm ci`
- Python 3 for source and built-output audits
- Netlify CLI for local function testing

## Local setup

```bash
cp .env.example .env
npm install --no-audit --no-fund  # first connected run only; commits package-lock.json
# npm ci                           # all later reproducible runs
npm run validate:source
npm test
npm run build
npm run netlify:dev
```

Use test credentials and synthetic data only. Do not use live applicant information during development.

For local CMS content editing:

```bash
npm run cms:local
```

Then open `/admin/` through the local site. Repository-backed authentication requires the connected GitHub/Netlify OAuth setup and cannot be validated from source alone.

## Validation commands

```bash
npm run validate:source   # source structure, routes, links, configuration files
npm test                  # server validation, Turnstile, HTTP, and upload tests
npm run check             # Astro and TypeScript checks
npm run build             # check, build, and built-output audit
npm run netlify:smoke     # local Netlify route/function smoke test
npm run validate          # source validation, tests, and production build
```

## Launch controls

- `PUBLIC_SITE_READY=false` forces page-level `noindex` and a disallow-all robots policy.
- `PUBLIC_PROFILE_CLAIMS_VERIFIED=false` prevents unverified professional claims from entering Person structured data.
- Draft content remains hidden from normal public collections unless `PUBLIC_SHOW_DRAFT_CONTENT=true` in a controlled review environment.
- The build audit fails a ready-for-indexing build when known placeholder or verification markers remain.
- Production contexts in `netlify.toml` intentionally keep `PUBLIC_SITE_READY=false`; launch requires an explicit reviewed change.

## Security and privacy

- Real `.env` files, credentials, résumés, submissions, private photographs, and compliance documents must never enter the public repository.
- Résumés are uploaded to a private bucket and shared through short-lived signed links, never as email attachments.
- A storage lifecycle deletion rule is mandatory. Application metadata must not be written to source control.
- The form endpoint requires origin checks, server validation, Turnstile, and Netlify rate limiting.

## Documentation

- `IMPLEMENTATION_AUDIT.md`
- `BLUEPRINT_REVIEW.md`
- `TECHNICAL_ARCHITECTURE.md`
- `ENVIRONMENT_CONFIGURATION.md`
- `FORM_UPLOAD_ARCHITECTURE.md`
- `CONTENT_EDITOR_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`
- `TESTING_CHECKLIST.md`
- `LAUNCH_CHECKLIST.md`
- `VALIDATION_REPORT.md`

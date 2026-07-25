# Shane Perez — Personal Brand Website

A controlled-review Astro website implementing the approved **Shane Perez — Builder of Builders** blueprint. It balances personal brand and leadership, recruitment and career opportunities, and financial education and consultation.

> **Current status: Not Ready for Staging.** The repository validation pipeline passes. A GitHub Actions-based staging deployment workflow and server-side Netlify Edge access gate are now prepared, but no functioning deployment is claimed until the protected `staging` environment secrets are configured and the manual deployment workflow succeeds. Keep `PUBLIC_SITE_READY=false`.

## Canonical repository

- Repository: `Jpelotea/clientshanewebsite`
- Default branch: `main`
- Working branch: `chore/technical-validation-and-staging`
- Draft pull request: `#1`
- Netlify staging site: `shane-perez-personal-brand-staging`
- Netlify site ID: `dd1bcef7-8547-4492-b0d4-46bae30f8582`
- Production deployment: not authorized

Do not force-push shared history, merge the draft pull request, enable indexing, enable live applicant intake, or commit credentials, applicant data, résumés, private media, or form submissions.

## Technology

- Astro static site and TypeScript
- Netlify hosting, Functions, and a staging-only Edge Function
- Decap CMS with GitHub backend and editorial workflow
- Cloudflare Turnstile
- Resend notifications
- One private S3-compatible résumé-storage provider
- Consent-gated Google Analytics and Meta Pixel
- Vitest, source validation, built-output auditing, and GitHub Actions

## Local validation

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

Use isolated test credentials and synthetic data only.

## GitHub Actions

- `Validate website` runs repository, unit, Astro, TypeScript, build, output, and Netlify local smoke checks.
- `Deploy staging` is a protected manual workflow. It accepts `draft` or `staging-primary`, validates the exact branch, deploys through the pinned Netlify CLI in the lockfile, and runs authenticated post-deployment smoke tests.

Configuration instructions are in `STAGING_DEPLOYMENT.md` and `SECURE_CREDENTIAL_CONFIGURATION.md`.

## Launch controls

- `PUBLIC_SITE_READY=false` forces page-level `noindex` and a disallow-all robots policy.
- `PUBLIC_PROFILE_CLAIMS_VERIFIED=false` prevents unverified professional claims from entering Person structured data.
- `PUBLIC_SHOW_DRAFT_CONTENT=false` excludes draft collection content.
- `PUBLIC_FORMS_ENABLED=false` renders the three forms for layout review while disabling all fields and final submission.
- Production analytics and Meta Pixel IDs remain empty.
- The staging Edge Function fails closed when access-gate credentials are incomplete.

## Security and privacy

- Real `.env` files, credentials, résumés, submissions, private photographs, and compliance documents must never enter the public repository.
- The staging gate uses server-side HTTP Basic Authentication over HTTPS. GitHub stores the plaintext review password only as a protected environment secret; Netlify receives a SHA-256 hash.
- Résumés are stored in one configured private external bucket and shared only through short-lived signed links—not email attachments.
- Public forms remain disabled until Turnstile, storage, email, rate limiting, and failure recovery pass in isolated staging.

## Documentation

- `BLUEPRINT_REVIEW.md`
- `IMPLEMENTATION_AUDIT.md`
- `TECHNICAL_ARCHITECTURE.md`
- `ENVIRONMENT_CONFIGURATION.md`
- `FORM_UPLOAD_ARCHITECTURE.md`
- `CONTENT_EDITOR_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`
- `STAGING_DEPLOYMENT.md`
- `SECURE_CREDENTIAL_CONFIGURATION.md`
- `STAGING_TEST_REPORT.md`
- `TESTING_CHECKLIST.md`
- `LAUNCH_CHECKLIST.md`
- `REMAINING_REQUIREMENTS.md`
- `VALIDATION_REPORT.md`

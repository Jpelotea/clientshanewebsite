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
npm install --no-audit --no-fund
npm run validate:source
npm test
npm run check
npm run build
npm run netlify:dev
```

Use test credentials and synthetic data only. Do not use live applicant information during development.

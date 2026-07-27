# Netlify Staging and Deployment Guide

## Existing staging project

- Netlify project: `shane-perez-personal-brand-staging`
- Site ID: `dd1bcef7-8547-4492-b0d4-46bae30f8582`
- Reserved address: `https://shane-perez-personal-brand-staging.netlify.app`
- GitHub repository: `Jpelotea/clientshanewebsite`
- Working branch: `chore/technical-validation-and-staging`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Edge Functions directory: `netlify/edge-functions`
- Node version: 22

Do not create another Netlify project. The reserved address is not a functioning staging URL until a successful deployment exists.

## Primary deployment path

The primary staging path is `.github/workflows/deploy-staging.yml` using the protected GitHub environment `staging`.

1. Configure the environment and secrets using `SECURE_CREDENTIAL_CONFIGURATION.md`.
2. Let the push to `chore/technical-validation-and-staging` create the initial **Deploy staging** run.
3. Approve the `staging` environment when required. If secrets were added after the first attempt, use **Re-run all jobs**.
4. Use `draft` for the initial branch-triggered deployment. The manual `workflow_dispatch` target selector becomes available through the standard **Run workflow** UI after the workflow exists on the default branch.
5. Review the job summary, immutable deploy URL, access challenge, and smoke-test result.
6. Run `staging-primary` only after the draft deployment passes and the reserved staging address should be updated.

The workflow uses the committed `netlify-cli` version through `npx --no-install netlify`. It does not install an unpinned global CLI.

## Server-side staging access

`netlify/edge-functions/staging-access.ts` protects every staging path before content is returned. It reads:

- `STAGING_ACCESS_ENABLED`
- `STAGING_ACCESS_USERNAME`
- `STAGING_ACCESS_PASSWORD_HASH`

Unauthorized requests return `401`, `WWW-Authenticate`, `Cache-Control: no-store`, and `X-Robots-Tag: noindex`. Missing gate configuration fails closed with `503`.

## Disabled form state

Milestone A builds use `PUBLIC_FORMS_ENABLED=false`. Recruitment, consultation, and contact forms remain visible for design and accessibility review, but their fieldsets and submit buttons are disabled and the pages state that no information will be submitted or stored.

The custom Netlify Function remains protected and must fail safely while provider credentials are absent. Netlify Forms remains disabled.

## Local fallback

```bash
git clone https://github.com/Jpelotea/clientshanewebsite.git
cd clientshanewebsite
git checkout chore/technical-validation-and-staging
npm ci --no-audit --no-fund
npm run validate:source
npm test
npm run check
npm run build
npx netlify login
npx netlify link --id dd1bcef7-8547-4492-b0d4-46bae30f8582
npx netlify deploy --build
```

The GitHub Actions workflow is the repeatable primary path; this local process is only a fallback.

## Milestone B

After Milestone A deploys successfully, configure and test Turnstile, private S3, Resend, rate limiting, and Decap CMS OAuth. Do not enable live applicant intake until every provider path, partial failure, cleanup behavior, browser review, and compliance requirement passes.

## Production promotion

Production requires separate explicit authorization, approved content and disclosures, verified provider accounts, final domain decisions, and a reviewed change to launch controls. PR #1 must remain draft and unmerged during staging work.

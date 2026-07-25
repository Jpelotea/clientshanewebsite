# Staging Test Report

## Current milestone

**Milestone A pipeline prepared — deployment not yet executed**

The GitHub Actions deployment workflow, staging-only server-side access gate, disabled-form presentation, and post-deployment smoke-test script are implemented on the working branch. An actual deploy ID and URL require the protected GitHub `staging` environment secrets and a manually approved workflow run.

## Implemented checks

The deployment workflow will verify before upload:

- Exact approved branch
- Existing Netlify site ID
- Committed lockfile
- Dependency installation
- Source validation
- Unit tests
- Astro and TypeScript checks
- Production build
- Staging `noindex` output
- Disallow-all robots output
- Disabled form notices and fieldsets
- Absence of eagerly loaded Google Analytics and Meta Pixel scripts

The post-deployment smoke test will verify:

- Unauthenticated `401` response and Basic challenge
- Authorized route access
- Required route headings and HTTP results
- Page-level `noindex`
- Disallow-all `robots.txt`
- Draft PDF response and `X-Robots-Tag`
- Custom 404 behavior
- Disabled recruitment, consultation, and contact forms
- Safe Function failure while provider credentials are absent
- No eager analytics or Meta Pixel loading

## Pending evidence

No successful GitHub Actions staging deployment has been executed yet. Therefore these fields remain pending:

- Netlify deploy ID
- Deploy-specific URL
- Primary staging deployment result
- Live access-gate result
- Live route matrix
- Live security headers
- Browser accessibility review
- Responsive review
- Lighthouse/performance review
- Turnstile, S3, Resend, rate-limit, and CMS OAuth tests

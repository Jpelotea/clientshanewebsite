# Staging Test Report

## Current milestone

**Milestone A pipeline validated — deployment not yet executed**

The GitHub Actions deployment workflow, staging-only server-side access gate, disabled-form presentation, and post-deployment smoke-test script are implemented on the working branch. Standard validation run #43 passed for commit `7aa4d50141586638d090942928aa78d6fd8b330e`.

An actual deploy ID and URL still require the protected GitHub `staging` environment secrets and an approved deployment workflow run.

## Completed validation

- Committed lockfile installation
- Source validation
- Unit tests, including Edge access-gate tests
- Astro and TypeScript checks
- Controlled production build
- Built-output audit
- Netlify local smoke test
- Staging disabled-form output checks
- `noindex` and disallow-all robots controls

## Deployment workflow checks prepared

The deployment workflow will verify before upload:

- Exact approved branch
- Existing Netlify site ID
- Committed lockfile
- Dependency installation and complete validation
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

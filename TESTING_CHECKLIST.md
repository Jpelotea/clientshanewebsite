# Testing Checklist

## Repository validation

- [ ] `npm ci --no-audit --no-fund`
- [ ] `npm run validate:source`
- [ ] `npm test`, including staging Edge gate tests
- [ ] `npm run check`
- [ ] `PUBLIC_FORMS_ENABLED=false npm run build`
- [ ] Built-output audit confirms noindex, robots, links, accessibility associations, and disabled forms
- [ ] `npm run netlify:smoke`
- [ ] Standard GitHub Actions workflow succeeds

## Staging deployment workflow

- [ ] GitHub `staging` environment exists and is branch-restricted
- [ ] Required environment secrets exist
- [ ] Wrong branch is rejected
- [ ] Wrong/missing site ID is rejected
- [ ] Draft deploy produces a deploy ID and immutable URL
- [ ] Server-side access gate returns 401 without credentials
- [ ] Authorized request returns site content
- [ ] Missing gate configuration fails closed with 503
- [ ] GitHub summary contains no credentials
- [ ] `npm run postdeploy:smoke` passes

## Static route and browser review

- [ ] Required pages and `/admin/` render
- [ ] Visible article routes render when approved/test content exists
- [ ] Navigation, mobile menu, footer, breadcrumbs, CTAs, legal links, and resource links work
- [ ] Custom 404 works
- [ ] Draft PDF downloads over HTTPS and remains noindex
- [ ] Small mobile through large desktop layouts pass
- [ ] Keyboard, focus, headings, labels, status messages, contrast, zoom, reduced motion, and touch targets pass
- [ ] Security headers and CSP pass
- [ ] Lighthouse or equivalent representative-route review passes material thresholds

## Forms and Milestone B integrations

- [ ] Milestone A forms show disabled notice and cannot submit
- [ ] Turnstile Siteverify cases pass
- [ ] Origin, honeypot, method, body-size, schema, and rate-limit rejection pass
- [ ] Recruitment, consultation, and contact success/failure states pass with synthetic data
- [ ] Valid and invalid résumé cases pass
- [ ] S3 remains private and signed-link expiry works
- [ ] Résumés are never email attachments
- [ ] Resend success/failure and storage cleanup pass
- [ ] No personal data remains after testing

## CMS

- [ ] GitHub OAuth authorized login and unauthorized denial
- [ ] Draft, editorial branch/PR, preview, publish, render, removal, logout, expiry, and callback-failure cases
- [ ] No OAuth secret in public source
- [ ] No confidential content stored in CMS

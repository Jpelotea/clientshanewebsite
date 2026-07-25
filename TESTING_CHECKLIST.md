# Testing Checklist

## Automated repository checks

- [ ] `npm ci` completes from the committed lockfile
- [ ] `npm run validate:source` passes
- [ ] `npm test` passes
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] Built-output audit passes with `PUBLIC_SITE_READY=false`
- [ ] `npm run netlify:smoke` passes
- [ ] GitHub Actions completes successfully

## Route and navigation checks

- [ ] All 18 required static routes render
- [ ] Dynamic article routes render for approved/test content
- [ ] Desktop navigation, mobile menu, footer, breadcrumbs, and calls to action work
- [ ] Legal links, form links, article links, and resource links resolve
- [ ] Custom 404 response and navigation work
- [ ] No staging page is indexable

## Forms and integrations

- [ ] Recruitment, consultation, and contact field validation
- [ ] Missing, failed, mismatched-action, reused, and invalid-host Turnstile behavior
- [ ] Origin and unsupported-method rejection
- [ ] Honeypot and platform rate-limit response
- [ ] Safe loading, success, failure, and screen-reader status states
- [ ] PDF, DOC, DOCX, invalid signature, oversize, and mismatched MIME tests
- [ ] Private test upload and expiring protected link
- [ ] No résumé email attachments
- [ ] Resend delivery success and failure/cleanup path
- [ ] AWS S3 lifecycle rule or approved R2 lifecycle process
- [ ] All synthetic test objects and emails deleted after review

## CMS

- [ ] GitHub OAuth login on staging
- [ ] Correct repository and main publishing branch
- [ ] Editorial workflow creates auditable branches/pull requests
- [ ] Articles, testimonials, leaders, team stories, events, achievements, resources, homepage, and FAQs edit correctly
- [ ] Draft and approved content behavior
- [ ] Public media paths and upload permissions
- [ ] No confidential data stored in CMS

## Accessibility

- [ ] Keyboard-only navigation and skip link
- [ ] Mobile menu focus behavior and Escape handling
- [ ] Visible focus indicators and adequate touch targets
- [ ] Logical headings and landmarks
- [ ] Labels, descriptions, error association, and status announcements
- [ ] Color contrast and 200% zoom
- [ ] Reduced-motion behavior
- [ ] Image alternative text
- [ ] Automated accessibility scan of representative routes

## SEO, consent, and performance

- [ ] Unique titles and meta descriptions
- [ ] Canonical URLs and Open Graph metadata
- [ ] Structured data contains verified claims only
- [ ] Staging robots disallows all and advertises no sitemap
- [ ] Production sitemap/robots tested only after approval
- [ ] Analytics and Meta scripts absent before consent
- [ ] Consent persistence, update, and withdrawal
- [ ] Missing tracking IDs cause no browser errors
- [ ] Asset sizes, image loading, layout stability, and hydration reviewed

## Security and repository hygiene

- [ ] No secrets, `.env`, private media, applicant data, or test uploads in Git
- [ ] Security headers and CSP reviewed on staging
- [ ] Authorized recipient and mailbox access reviewed
- [ ] Storage credentials use least privilege
- [ ] Signed-link expiry and retention deletion verified
- [ ] Logs contain no submitted personal data

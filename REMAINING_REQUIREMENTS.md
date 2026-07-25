# Remaining Requirements Register

Last updated: July 25, 2026

## Milestone A — GitHub and Netlify staging

- [ ] Create/configure GitHub environment `staging`
- [ ] Restrict deployment branches to `chore/technical-validation-and-staging`
- [ ] Add a required reviewer where supported
- [ ] Add `NETLIFY_AUTH_TOKEN` as an environment secret
- [ ] Add `NETLIFY_SITE_ID=dd1bcef7-8547-4492-b0d4-46bae30f8582`
- [ ] Add unique `STAGING_ACCESS_USERNAME` and `STAGING_ACCESS_PASSWORD` secrets
- [ ] Confirm the standard validation workflow passes for the staging-pipeline commit
- [ ] Run `Deploy staging` with target `draft`
- [ ] Record deploy ID and immutable deploy URL
- [ ] Confirm unauthorized 401 and authorized access
- [ ] Confirm route, noindex, robots, PDF, 404, disabled forms, and safe Function smoke tests
- [ ] Run browser accessibility, responsive, security-header, consent, and performance review
- [ ] Decide whether to publish the passing build to `staging-primary`

## Milestone B — provider configuration

- [ ] Cloudflare Turnstile staging site key and secret
- [ ] Turnstile valid, missing, invalid, expired, reused, action, hostname, timeout, and provider-error tests
- [ ] Private AWS S3 staging bucket with Block Public Access, encryption, least privilege, and lifecycle deletion
- [ ] Valid/invalid résumé uploads, signed-link access/expiry, public denial, and cleanup tests
- [ ] Resend staging key, verified sender, synthetic recipients, delivery/failure/timeout/rate-limit tests
- [ ] Decap CMS GitHub OAuth application, callback, editor authorization, draft, editorial workflow, publish, and cleanup tests
- [ ] Live Netlify rate-limit tests
- [ ] Multi-provider partial-failure and ambiguous-response recovery tests

## Shane’s content

- [ ] Final professional biography and approved quotations
- [ ] Verified titles, dates, credentials, awards, GAMA participation, conventions, and organization figures
- [ ] Approved professional, mentorship, team, event, award, and social-sharing photographs
- [ ] Two Financial Advisor testimonials with permission
- [ ] One leadership testimonial with permission
- [ ] Two team success stories with permission
- [ ] Two client testimonials with permission
- [ ] Two leadership profiles with approved details and permissions
- [ ] Confirmed public contact channels and branch address
- [ ] Shane interview responses for the launch articles
- [ ] Final approved career-fit guide

## Compliance and legal approval

- [ ] Personal-site association disclosure
- [ ] Manulife references and required company wording
- [ ] Recruitment criteria, role, process, and career language
- [ ] Earnings, promotion, independence, and success disclaimers
- [ ] Financial-information and consultation scope
- [ ] Credentials, awards, events, organization figures, and growth-goal claims
- [ ] Testimonials and client stories
- [ ] Privacy Policy and data-protection contact
- [ ] Cookie Notice and consent configuration
- [ ] Website Terms and external-link wording
- [ ] Recruitment, financial-information, and testimonial disclaimers
- [ ] Applicant consent and retention/deletion procedure
- [ ] Final downloadable guide

## Production-only requirements

- [ ] Explicit production-deployment authorization
- [ ] Final domain ownership and DNS
- [ ] Professional email
- [ ] Production Turnstile, Resend, storage, CMS OAuth, origin, and analytics values
- [ ] Remove temporary staging gate
- [ ] Reviewed change setting `PUBLIC_SITE_READY=true`
- [ ] Production sitemap and Search Console submission
- [ ] Monitoring, rollback, incident contact, and maintenance owner

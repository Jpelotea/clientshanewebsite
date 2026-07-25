# Remaining Requirements Register

Last updated: July 25, 2026

## Technical staging accounts and credentials

- [ ] Netlify staging project connected to `Jpelotea/clientshanewebsite`
- [ ] Protected-access method selected for non-production deployments
- [ ] `PUBLIC_SITE_READY=false` verified in staging
- [ ] Cloudflare Turnstile staging site key and secret
- [ ] Turnstile allowed staging hostname and action configuration
- [ ] Resend test API key and verified development sender domain
- [ ] Approved synthetic-test recipient addresses
- [ ] Private AWS S3 test bucket with Block Public Access
- [ ] Least-privilege AWS credentials
- [ ] S3 server-side encryption and lifecycle deletion rule
- [ ] GitHub OAuth application and Netlify OAuth provider for Decap CMS
- [ ] Approved staging origin allowlist
- [ ] Google Analytics and Meta Pixel IDs only when privacy/compliance approval is complete

## Credential-dependent test evidence

- [ ] Turnstile valid, missing, invalid, expired, reused, action-mismatched, hostname-mismatched, and direct-endpoint tests
- [ ] Valid PDF, DOC, and DOCX résumé uploads
- [ ] Invalid extension, MIME, signature, oversized file, malicious filename, duplicate name, and storage-failure tests
- [ ] Signed-link access and expiry tests
- [ ] S3 public-access denial and lifecycle deletion verification
- [ ] Resend success, delivery failure, and storage-cleanup behavior
- [ ] Consultation and contact end-to-end synthetic submissions
- [ ] Decap CMS login, draft, editorial branch/pull request, publish, render, and test-content removal
- [ ] Protected Netlify deployment route and function tests
- [ ] Browser-level keyboard, focus, responsive, consent, SEO, headers, and performance checks

## Shane’s content

- [ ] Final professional biography and approved quotations
- [ ] Verified titles, dates, employment history, credentials, awards, GAMA participation, conventions, and organization figures
- [ ] Approved executive, mentorship, team, event, award, and social-sharing photographs
- [ ] Two Financial Advisor testimonials with written permission
- [ ] One Unit Head or Senior Unit Head testimonial with written permission
- [ ] Two team success stories with written permission
- [ ] Two client testimonials with written permission
- [ ] Two leadership profiles with approved roles, summaries, achievements, photographs, and permissions
- [ ] Confirmed public email, mobile, Facebook, Messenger, LinkedIn, and branch address
- [ ] Shane’s interview responses for the four launch articles
- [ ] Final approved career-fit guide

## Compliance and legal approval

- [ ] Personal-site association disclosure
- [ ] Manulife references and required company wording
- [ ] Recruitment criteria, role description, process, and career language
- [ ] Earnings, income, promotion, independence, and success disclaimers
- [ ] Financial-information and consultation scope
- [ ] Credentials, awards, event, team-size, and growth-goal claims
- [ ] Testimonials and client stories
- [ ] Privacy Policy and data-protection contact
- [ ] Cookie Notice and consent configuration
- [ ] Website Terms and external-link wording
- [ ] Recruitment, financial-information, and testimonial disclaimers
- [ ] Data-processing consent and applicant retention/deletion procedure
- [ ] Final downloadable guide

## Production-only requirements

- [ ] Explicit written production-deployment authorization
- [ ] Final domain ownership and DNS configuration
- [ ] Professional email configuration
- [ ] Production-only Turnstile, Resend, storage, CMS OAuth, origin, and analytics values
- [ ] Reviewed change setting `PUBLIC_SITE_READY=true`
- [ ] Production sitemap and Search Console submission
- [ ] Post-launch monitoring, rollback, incident contact, and technical-maintenance owner

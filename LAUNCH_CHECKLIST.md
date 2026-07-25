# Launch Checklist

## Milestone A staging

- [ ] Standard validation passes on the working branch
- [ ] Protected `Deploy staging` workflow passes for a draft deploy
- [ ] Actual deploy ID and immutable URL recorded
- [ ] Server-side staging access verified
- [ ] Indexing, draft content, profile claims, analytics, Meta Pixel, and forms remain disabled
- [ ] Route, PDF, 404, and Function safe-failure smoke tests pass
- [ ] Browser accessibility, responsive, consent, headers, and performance review completed
- [ ] PR #1 remains open, draft, and unmerged

## Milestone B integrations

- [ ] Turnstile, S3, Resend, CMS OAuth, rate limiting, and partial failure recovery pass in isolated staging
- [ ] Synthetic test emails, objects, CMS entries, and submissions are removed
- [ ] Live intake remains disabled until all approval gates pass

## Content and permissions

- [ ] Shane approves every visible page and article
- [ ] Biography, title, dates, awards, events, figures, and statistics are verified
- [ ] Leadership profiles, testimonials, and photographs have permission
- [ ] Public contact channels and branch address are verified
- [ ] Draft placeholders and temporary social image are removed or excluded
- [ ] Final career-fit guide replaces the review draft

## Compliance and legal

- [ ] Manulife wording and disclosures approved
- [ ] Recruitment and financial-information wording approved
- [ ] Privacy Policy, Cookie Notice, Terms, consent, disclaimers, and retention process approved
- [ ] Personal-site disclosure visible
- [ ] Testimonials, statistics, and structured data approved

## Production release

- [ ] Explicit production authorization recorded
- [ ] Final production environment values set securely
- [ ] Temporary staging gate removed
- [ ] `PUBLIC_FORMS_ENABLED=true` only after provider tests and approvals
- [ ] `PUBLIC_SITE_READY=true` reviewed separately
- [ ] Production domain and canonical URL confirmed
- [ ] Sitemap, Search Console, and consent-gated production analytics enabled only after approval
- [ ] Monitoring, rollback, incident contact, and maintenance owner assigned

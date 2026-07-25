# Launch Checklist

## Content and permissions

- [ ] Shane has approved every visible page and article
- [ ] Biography, title, dates, awards, events, team size, and statistics are verified
- [ ] Leadership profiles and testimonials have written permission
- [ ] Photographs and event materials have publication permission
- [ ] Public email, mobile number, social links, Messenger link, and branch address are verified
- [ ] Draft placeholders, verification notes, and temporary social image are removed or intentionally excluded
- [ ] Final career-fit guide replaces the review draft

## Compliance and legal

- [ ] Manulife references and required disclaimers are approved
- [ ] Recruitment criteria and claims are approved
- [ ] Financial-information and consultation wording are approved
- [ ] Privacy Policy, Cookie Notice, Terms, disclosures, consent wording, and retention process are approved
- [ ] Personal-site/non-corporate disclosure is visible
- [ ] Testimonials, statistics, and structured data are approved

## Accounts and security

- [ ] Repository, Netlify, domain, analytics, Search Console, Meta, Turnstile, Resend, and storage are owned by Shane or an authorized organization
- [ ] GitHub and CMS editor access uses least privilege
- [ ] Storage bucket is private and lifecycle deletion is active
- [ ] Sender domain and notification recipients are verified
- [ ] Production credentials are stored only in approved secret managers
- [ ] Incident contact and credential-rotation process are documented

## Technical approval

- [ ] Pull request reviewed and approved
- [ ] Lockfile committed and GitHub Actions passing
- [ ] Production build and all required routes pass
- [ ] Staging end-to-end forms, upload, Turnstile, email, and rate limiting pass
- [ ] CMS login and editorial workflow pass
- [ ] Accessibility, responsive, SEO, consent, performance, and security reviews pass
- [ ] Custom 404, headers, redirects, and rollback procedure pass
- [ ] All test submissions, emails, and uploads are deleted

## Production release

- [ ] Explicit authorization to deploy production is recorded
- [ ] Final production environment values are set
- [ ] `PUBLIC_SITE_READY=true` change is reviewed
- [ ] Production domain and canonical URL are confirmed
- [ ] Turnstile, origin allowlist, OAuth callback, and consent settings include the production domain
- [ ] Sitemap and Search Console are enabled only after approval
- [ ] Production analytics are verified after consent
- [ ] Post-launch monitoring and technical-maintenance owner are assigned

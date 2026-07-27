# Missing Information and Implementation Risks

## Required before a public launch

- Approved professional photographs and image-use permissions
- Final professional biography in Shane's own voice
- Verified employment dates, titles, awards, events, GAMA details, team size, and 2030 goal wording
- Two leadership profiles with permission
- Two Financial Advisor testimonials, one leader testimonial, two team stories, and two client testimonials with written permission
- Public email, mobile, Messenger, Facebook, LinkedIn, and exact branch address
- Shane's and secretary's actual notification email addresses
- Manulife-provided disclaimers and approved company-specific wording
- Approved privacy, cookie, recruitment, testimonial, and financial-information notices
- Final résumé retention period and deletion owner
- Real Turnstile, Resend, storage, analytics, and Meta credentials
- GitHub repository owner and CMS OAuth configuration

## Schedule risk

Development begins July 26, 2026, with a requested launch on August 8, 2026. A complete approved launch is possible only if content and assets arrive immediately, decisions remain fixed, and Shane and compliance reviewers respond within two business days. The codebase can be deployed as a controlled review build before all public content is approved.

## Security and privacy risks

- Résumés contain personal information and must never be placed in a public bucket or emailed as attachments.
- A storage lifecycle rule should delete files after the approved retention period; object metadata alone does not perform deletion.
- Recipient access and link forwarding must be controlled operationally.
- Preview domains must be added to Turnstile and allowed-origin settings before form testing.
- Analytics and Meta Pixel must remain unset until consent wording and IDs are approved.

## Content and compliance risks

- Company-specific recruiting language may imply an official corporate relationship if the personal-site disclosure is unclear.
- Awards, dates, statistics, testimonials, and photographs can create credibility and privacy risk if published before verification.
- General financial content must not become individualized advice or unapproved product promotion.
- Draft content is hidden in normal production by default; enabling draft previews publicly would expose unapproved placeholders.

## Technical risks

- Decap CMS with GitHub backend requires an authorized OAuth flow and repository access.
- Netlify, package, and third-party service limits can change; review current plans before launch.
- Major layout changes remain developer work even with a CMS.

# Netlify Configuration

`netlify.toml` defines:

- Astro build command and `dist` publish directory
- Netlify function directory and esbuild bundling
- Local Netlify Dev ports
- Security headers and Content Security Policy
- HSTS, frame denial, referrer controls, and asset caching
- No-store behavior for the CMS path

The form function defines its own `/api/forms/:formType` path and rate-limit configuration. Do not add a second competing rewrite unless the deployment environment requires it and the route is retested.

Before deployment, update the production domain in the Astro, CMS, robots, Turnstile, allowed origins, OAuth, analytics, and Search Console configuration.

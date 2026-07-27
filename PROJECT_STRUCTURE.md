# Project File Structure

```text
shane-perez-website/
├── astro.config.mjs
├── netlify.toml
├── package.json
├── .env.example
├── netlify/functions/
│   ├── forms.ts
│   └── _shared/
│       ├── email.ts
│       ├── http.ts
│       ├── storage.ts
│       ├── turnstile.ts
│       └── validation.ts
├── public/
│   ├── admin/
│   │   ├── index.html
│   │   └── config.yml
│   ├── documents/
│   ├── icons/
│   └── images/
└── src/
    ├── components/
    │   ├── cards/
    │   ├── forms/
    │   ├── global/
    │   ├── navigation/
    │   ├── sections/
    │   └── seo/
    ├── content/
    │   ├── achievements/
    │   ├── articles/
    │   ├── events/
    │   ├── leaders/
    │   ├── resources/
    │   └── testimonials/
    ├── data/
    ├── layouts/
    ├── lib/
    ├── pages/
    │   └── insights/
    └── styles/
```

The structure keeps page composition, design components, editable content, serverless processing, and external-service concerns separate.

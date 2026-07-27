# Design System

## Visual character

Minimalist, premium, warm, leadership-focused, and professional without copying a corporate Manulife website.

## Tokens

- Primary dark green: `#0B3A2B`
- Deep green: `#06261C`
- Supporting green: `#1F6B52`
- Warm accent: `#C99A4B`
- White: `#FFFFFF`
- Soft neutral: `#F3F5F2`
- Warm neutral: `#FAF7F0`
- Charcoal: `#18201D`

## Typography

- Editorial headings: Georgia / Times fallback
- Interface and body: Inter if available, otherwise system sans-serif
- Fluid type sizes through CSS `clamp()`

## Layout

- Maximum page container: 74rem
- Reading width: 46rem
- Mobile-first grids with two breakpoints
- Generous section spacing and stable media placeholders

## Components

Buttons, cards, badges, notices, forms, placeholders, navigation, footer, breadcrumbs, article layout, cookie controls, and states are defined in `src/styles/global.css` and modular Astro components.

## Accessibility

Visible focus states, semantic structure, keyboard-operable menus, labeled fields, live status messages, reduced-motion support, and contrast-conscious color combinations are built into the foundation.

# Satvik Krishna — Portfolio (single-page, scroll-animated)

One long scrolling page in a soft sage-and-cream palette, with Apple-style scroll animations, plus a private admin panel where you can upload photos, add projects, and reorder everything yourself.

## Look and feel

- Palette: cream `#f5f0e8` base, `#dce5d4` panels, sage `#a8c0a0` accents, deep sage `#7d9b76` for links/CTAs, warm charcoal text. Light, comfortable, no dark mode.
- Type: editorial serif headings (Instrument Serif) + clean sans body (Work Sans). Once you upload your photos/brand, I can swap the pairing to match.
- Nothing borrowed from the reference site's dark aesthetic — only its section structure (Hero, About, Experience, Projects, Skills, Contact).
- Motion: scroll-linked reveals, parallax image layers, sticky section headers, a hero that scales/fades as you scroll, counters and staggered chip animations, magnetic hover on cards. Motion respects reduced-motion settings.

## Page sections (in scroll order)

1. **Hero** — your name, "Computer Science Engineering · RV College of Engineering, Bengaluru", location line, scroll cue, background photo slot (placeholder until you upload).
2. **About** — bio text + portrait slot, social icon row (Email, LinkedIn, GitHub, phone).
3. **Experience** — KuKClean Product & Design Intern, animated timeline.
4. **Projects** — cards for Meridian, Anchor, CrowdSense from your resume: role, stack chips, bullet highlights, GitHub / live-demo links, and an embedded demo video per project when you add one.
5. **Skills** — grouped chips (Languages, Python Libraries, AI/ML, Tools & Design, Certifications, Languages spoken).
6. **Contact** — "Let's Connect" with link cards: email, LinkedIn, GitHub, phone. No form.
7. Footer with copyright.

## Making it yours (admin panel) — everything is editable

- Backend enabled (Lovable Cloud) with an email/password login at `/admin`, restricted to your account only.
- Every piece of the site is editable from the admin, nothing hardcoded:
  - Hero: name, tagline, location line, background image/video.
  - About: each paragraph, portrait photo, social links (email, LinkedIn, GitHub, phone, Instagram).
  - Experience: add/edit/delete roles with company, dates, location, bullets.
  - Projects: title, subtitle, role, dates, bullets, tech chips, GitHub link, live link, demo video, cover image.
  - Skills: add/rename/delete whole categories and the chips inside them.
  - Certifications, interests, languages, contact cards, footer text, section headings and even section visibility (hide/show any section).
  - A photo gallery you can fill with as many uploads as you like.
- Drag-to-reorder everywhere: sections, projects, experience entries, skill categories, chips, gallery images.
- Live preview: changes save to the database and appear on the public page immediately.
- All resume content is seeded up front, so the site looks finished before you upload a single file.

## Making it genuinely impressive

- A crafted hero moment: layered depth, subtle grain, a name reveal with per-word masking, and a scroll cue that dissolves as you move.
- Scroll-driven storytelling: sticky pinned section headers, horizontal project scroll on desktop, parallax photo panels, animated counters (CGPA, project stats), a marquee of tools, and cursor-aware tilt/magnetic hover on cards.
- Custom cursor accent, smooth-scroll easing, page-load curtain, and a floating pill nav that morphs as sections change.
- Polished details: consistent radii, soft layered shadows, tasteful serif/sans contrast, mobile-tuned versions of every animation, and reduced-motion fallbacks.


## Technical notes

- TanStack Start single route `/` with hash-anchored sections + `/admin` gated route; smooth-scroll nav.
- Motion for React for scroll-driven animations; `useScroll`/`useTransform` for parallax and hero transitions.
- Cloud tables: `site_content` (key/value text blocks), `projects`, `media` (with `sort_order`), plus a storage bucket for uploads. RLS: public read, writes limited to authenticated admin; a `user_roles` table holds the admin role.
- Design tokens defined in `src/styles.css` as oklch semantic colors; no hardcoded colors in components.
- SEO: unique title/description/og tags for the page, semantic headings, alt text, lazy-loaded media.

## What I need from you later

Photos, demo videos, and live project URLs — you'll be able to upload them yourself through the admin panel once this is built.

# Portfolio

My personal portfolio: AI systems, product and design work. Every section is
driven from a Postgres-backed CMS that I edit through a built-in admin panel,
so updating projects, experience or the photo gallery never needs a redeploy.

## Highlights

- **CMS-driven sections:** hero, about, experience, education, projects, skills,
  a photography "lens" gallery and contact, all read from Supabase tables
- **Admin panel** (`/admin`): authenticated editors for each section, a theme
  editor and résumé upload, with role-based access via a `user_roles` table and
  row-level security
- **Motion that respects users:** scroll reveals and transitions that switch off
  under `prefers-reduced-motion`
- **Server-rendered** public pages with TanStack Start; the admin route is
  client-only

## Stack

| Layer | Tech |
|---|---|
| Framework | TanStack Start, React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, shadcn/ui (Radix primitives) |
| Data and auth | Supabase (Postgres, Auth, Storage, RLS) |
| Hosting | Vercel |

## Data model

`site_content` (singleton copy and theme), `projects`, `experiences`,
`skill_groups`, `lens_images`, `gallery_images`, `user_roles`.
Migrations live in [`supabase/migrations`](supabase/migrations).

## Run locally

```bash
npm install
# .env needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Build with `npm run build`, then preview with `npm run preview`.

# Copilot Instructions for AstroPaper Blog

## Project Overview

This is an **Astro 5.x** blog using the AstroPaper theme with **TailwindCSS 4**, **TypeScript**, and **React** for interactive components. It's a personal tech blog with content dating back to 2003.

## Architecture

- **Content**: Markdown posts in `src/data/blog/` using Astro Content Collections with Zod schema validation
- **Layouts**: `src/layouts/` - `Layout.astro` (base), `PostDetails.astro` (single post), `Main.astro` (page wrapper)
- **Components**: `src/components/` - Astro components (`.astro`) for static, React (`.tsx`) for interactive (e.g., `Comments.tsx`)
- **Config**: Site settings in `src/config.ts`, social links/Giscus in `src/constants.ts`

## Key Patterns

### Blog Post Frontmatter (required fields)
```yaml
---
title: "Post Title"
pubDatetime: 2024-01-20T10:00:00+01:00  # ISO 8601 with timezone
description: "Brief description for SEO"
tags:
  - tag-name
---
```
Optional: `author`, `modDatetime`, `featured`, `draft`, `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`

### Path Alias
Use `@/` for imports from `src/`:
```typescript
import { SITE } from "@/config";
import getSortedPosts from "@/utils/getSortedPosts";
```

### Styling (TailwindCSS 4)
- Theme colors defined as CSS custom properties in `src/styles/global.css`
- Dark mode: `data-theme="dark"` attribute on `<html>`, use `dark:` variant
- Key colors: `--accent`, `--background`, `--foreground`, `--muted`, `--border`

### Icons
SVG icons in `src/assets/icons/` imported as Astro components:
```astro
import IconGitHub from "@/assets/icons/IconGitHub.svg";
<IconGitHub class="h-6 w-6" />
```

### Dynamic Routing
- Posts: `src/pages/posts/[...slug]/index.astro` with `getStaticPaths()`
- Tags: `src/pages/tags/[tag]/[...page].astro`
- Uses `getPath(id, filePath)` utility for URL generation

### Content Filtering
- Draft posts: set `draft: true` in frontmatter
- Scheduled posts: `pubDatetime` in future (15min margin via `SITE.scheduledPostMargin`)
- Use `postFilter` utility for consistent filtering

## Developer Workflow

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build + pagefind search index
pnpm build:win    # Windows-only build (avoids `cp`)
pnpm preview      # Preview production build
pnpm format       # Prettier formatting
pnpm lint         # ESLint
```

**Build process** includes: `astro check` → `astro build` → `pagefind --site dist` → copy pagefind to public

## Agent Notes (Session Gotchas)

These are common pitfalls that came up during a Windows dev session and how to resolve them safely.

### 1) Windows build vs Cloudflare Pages build

- **Symptom (Windows)**: `pnpm build` fails with `cp` not recognized.
- **Constraint**: Do **not** change the default `pnpm build` script if the repo is deployed on Cloudflare Pages (Linux).
- **Fix**: Use the Windows-only script: `pnpm build:win`.
- **Implementation**: `build:win` runs the same build pipeline and replaces the final `cp` step with a Node script (`scripts/copy-pagefind.mjs`).

### 2) OG images and `ogImage` paths

- **Symptom**: Astro build fails with `ImageNotFound` when `ogImage` points at a file that only exists under `public/`.
- **Fix**: Follow the project’s existing pattern: reference images from `src/assets/images/` in frontmatter (or use a full external URL).
- **Example pattern** (see repo docs): `ogImage: ../../assets/images/<file>.png`.

### 3) Docker build context must include `.astro`

- **Symptom**: Docker builds fail or produce incomplete builds when `.dockerignore` excludes `*.astro`.
- **Fix**: Never ignore `*.astro` in `.dockerignore`. It’s source code required to build the site.

## Important Utilities

| Utility | Purpose |
|---------|---------|
| `getSortedPosts` | Filter & sort posts by date |
| `getPath(id, filePath)` | Generate post URL from content ID |
| `slugifyStr(str)` | Convert string to URL slug (kebab-case) |
| `postFilter` | Filter drafts and future posts |
| `generateOgImages.ts` | Dynamic OG image generation with Satori |

## Adding Features

**New social link**: Add to `SOCIALS` array in `src/constants.ts` with icon from `src/assets/icons/`

**New page**: Create in `src/pages/`, use `Main.astro` layout wrapper

**Modify OG images**: Edit templates in `src/utils/og-templates/`

## React Integration
React components use `client:` directives. `Comments.tsx` uses Giscus and requires client-side hydration:
```astro
<Comments client:only="react" />
```

## Node Version
Requires Node.js 20.x (see `.node-version` and `engines` in `package.json`)

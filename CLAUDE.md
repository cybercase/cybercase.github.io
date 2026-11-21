# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal blog/homepage (stefano.brilli.me) built with Next.js 14 (Pages Router) as a **fully static export** (`output: "export"`, `trailingSlash: true` in `next.config.js`). It is deployed to GitHub Pages (`gh-pages` branch of `cybercase/cybercase.github.io`). There is no server runtime: no API routes, ISR, or anything else that needs a Node server at request time.

## Commands

- `npm run dev`: dev server on http://localhost:3000
- `npm run build`: static build; output goes to `out/`
- `npm run lint`: `next lint` (config extends `next/core-web-vitals`)
- `npm run deploy`: builds and pushes `out/` to the `gh-pages` branch (with `--dotfiles` so `public/.nojekyll` and `CNAME` are kept)
- Formatting: Prettier (`.prettierrc`: 2 spaces, semicolons, `es5` trailing commas)

There is no test suite. A husky pre-commit hook runs `lint-staged`, which runs `eslint --cache` and `prettier --check` on staged `.js`/`.ts` files (and `.css` for Prettier).

## Architecture

**Content pipeline.** Blog posts are Markdown files in `posts/`, with YAML front matter parsed by `gray-matter`. The filename (without `.md`) is the slug, served at `/blog/<slug>/`. `lib/api.ts` reads the `posts/` directory and returns only the requested front-matter fields. Posts are sorted by `date`, newest first. The allowed fields are listed in `postMetaFields` in `lib/constants.ts`: `title`, `description`, `date`, and the cover fields `coverImage`, `coverTitle`, `coverSubtitle`, `coverCaption` and `coverDark`. To support a new front-matter field, add it there.

**Markdown rendering.** `markdownToHtml` in `lib/utils.ts` runs a unified pipeline at build time inside `getStaticProps`: remark-gfm, smartypants, remark-math (`$$` only; single-dollar inline math is disabled), rehype-highlight and rehype-katex (`throwOnError: true`, so invalid LaTeX fails the build). Raw HTML in Markdown is allowed. KaTeX CSS and Google Fonts are loaded from CDNs in `pages/_document.tsx`.

**RSS side effect.** `getStaticProps` in `pages/blog/index.tsx` also writes `public/feed.rss` to disk on every build or dev render. Because that file is committed, it shows up as modified after a build that changes posts. The feed's `updated` date is hard-coded on purpose so the output stays stable.

**Layouts.** Pages use a per-page layout pattern: `NextPageWithLayout` in `lib/constants.ts` has a `getLayout(page, props)` function, which `pages/_app.tsx` calls. Each page wraps itself in `BaseLayout` and passes in a `SiteHeader`. The header's cover props (image, title, dark mode, tall) come from post front matter or are set by the page.

**Styling.** Global SCSS partials in `styles/` are imported once through `styles/main.scss` in `_app.tsx`, and components use plain class names. `_document.tsx` also has Emotion critical-CSS extraction (`extractStaticCss`) wired in for server rendering.

## Notes

- The site's base URL (`baseUrl` in `lib/constants.ts`) is used to build absolute OG and RSS URLs.
- Static assets and post images live in `public/images/`, and posts reference them as `/images/...`.
- `out/`, `.next/` and `.eslintcache` are build artifacts.
- Branches: work happens on `main`; `master` is the remote default branch, and `gh-pages` is the deploy target.

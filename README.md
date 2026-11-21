# stefano.brilli.me

Personal homepage and blog, built with [Next.js](https://nextjs.org/) (Pages Router) as a fully static site and hosted on GitHub Pages.

## Development

Requires Node 26 (see `.nvmrc`; Node >= 20.9 can build, but the commit hook's lint-staged needs >= 22.22).

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint    # ESLint
npm run build   # static export to out/, then generates out/feed.rss
```

`npm install` also sets up a pre-commit hook that runs ESLint and Prettier on staged files.

## Writing a post

Add a Markdown file to `posts/`. The file name becomes the URL: `posts/my-post.md` is served at `/blog/my-post/`.

```markdown
---
title: "Post title"
description: "Used for the meta description, Open Graph and RSS"
date: "2026-01-31T00:00:00.000Z"
coverImage: "/images/my-cover.jpg" # optional, file in public/images/
coverTitle: "Short title" # optional, shown on the cover and in the archive
coverSubtitle: "Subtitle" # optional
coverDark: true # optional, light text over a dark cover
---

Content in GitHub-flavored Markdown. Math goes between `$$...$$`
(single `$` is not math). Code blocks are syntax-highlighted.
```

Invalid LaTeX fails the build.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, builds and deploys `out/` to GitHub Pages. Pull requests are built and checked but not deployed.

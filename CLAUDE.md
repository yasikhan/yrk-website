# yrkhan.com

Personal static site. No build step, no dependencies, no package manager — plain HTML, CSS,
and vanilla JS served as-is.

## Deploy

GitHub Pages builds from `main`; `CNAME` points at yrkhan.com. **Pushing to `main` publishes
the site**, so treat a push as going live. There is no staging branch or preview environment.

## Local preview

Serve over HTTP — do not open the files with `file://`:

```sh
python3 -m http.server 8000
```

The photo gallery `fetch`es `photos/manifest.json`, which the `file://` origin blocks, so the
galleries silently render their "no photos" empty state when opened directly from disk.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Landing page — hand-drawn bookshelf on `<canvas>`, drawn by `js/shelf.js` on top of `js/rough.js` |
| `about.html` | Prose page with handwritten margin annotations positioned absolutely |
| `research.html`, `writing.html`, `projects.html` | Tabbed list pages |
| `photography.html` | Photo gallery |
| `contact.html` | Links |
| `css/style.css` | The only shared stylesheet: `:root` design tokens, content-page layout, `.entry` lists, footer, responsive rules |
| `photos/` | Gallery images + `manifest.json` |
| `assets/fonts/`, `assets/YasiHand-*` | Self-hosted woff2 fonts |

Each page carries its own inline `<style>` block for page-specific rules and pulls shared
tokens/layout from `css/style.css`. Colors and fonts come from CSS variables (`--ink`,
`--ink2`…`--ink4`, `--highlight`, `--hand`, `--serif`, `--body`, `--mono`) — use those rather
than hardcoding values.

## The gallery script is duplicated

`photography.html` and `projects.html` (Photography tab) each contain their **own copy** of the
gallery rendering script and the `.polaroid*` CSS. They are not shared. Any change to caption
rendering, parsing, or polaroid styling must be made in both files or the two galleries drift
apart.

## Adding a photo

1. Drop the image in `photos/`.
2. Add the filename to `photos/manifest.json` by hand — there is no generator, and the
   directory is never listed at runtime. A file not in the manifest simply won't appear.

Filenames follow `title, location - year.ext`, e.g. `still water, kyoto, japan - 2026.jpeg`.
The parser splits the trailing year, then treats everything before the first comma as the title
and everything after as the location.

**Captions display only `location, year`** (small mono, `.polaroid-meta`). The title portion of
the filename survives only as the image `alt` text — keep writing descriptive titles, they just
aren't rendered. The parsed filename is `.trim()`ed, so a stray space before the extension
won't break year detection.

Use JPEG. Do not convert to WebP.

## Adding a project card

Copy an existing `.project-card` in `projects.html#technical` (header + year, desc, footer with
`.project-outputs` and `.project-card-tags`). Cards are ordered newest-first by year.

The entrance animation is staggered with an explicit `.project-card:nth-child(N)` delay list in
that file's `<style>` block. It is not generated — when the card count grows past the last
declared `N`, add the new delays or the trailing cards animate in with no stagger.

Output links carry `data-type` (`website` / `repo` / `paper` / `poster`), which drives the
colored dot. Tags carry `data-kind` (`lang` / `subject`).

## Adding a writing or research entry

Use the shared `.entry` pattern (`entry-title` > `a`, `entry-desc`, `entry-meta`) inside the
relevant tab container — `.writing-section` in `writing.html`, `.research-section` in
`research.html`. Entries are newest-first; `entry-meta` is a short date like `Aug 2026`.

## Tabbed pages

`research.html`, `writing.html`, and `projects.html` use `.section-tab[data-section]` buttons
that toggle an `.active` class on the matching section. All of them support hash deep links
(`/writing.html#technology`, `/projects.html#photography`). `projects.html` additionally widens
the container and lazy-loads the gallery on first switch to the Photography tab.

## New pages

Copy the `<head>` boilerplate from an existing page — it is repeated per page, not templated:
the inline Google Analytics tag, `<title>`, description, OpenGraph + Twitter card meta, favicon,
four font `<link rel="preload">` tags, then `css/style.css`. Also add the page to `sitemap.xml`.

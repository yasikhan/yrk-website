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
| `research.html`, `writing.html` | Tabbed list pages (tabs driven by `js/tabs.js`) |
| `projects.html` | Technical project cards |
| `photography.html` | Photo gallery |
| `contact.html` | Links |
| `css/style.css` | The only shared stylesheet: `:root` design tokens, content-page layout, `.entry` lists, footer, responsive rules |
| `photos/` | Gallery images + `manifest.json` |
| `assets/img/` | Site images — photos, sketches, logo, favicon |
| `assets/docs/` | PDFs — resume, papers, posters |
| `assets/fonts/` | Self-hosted woff2/ttf fonts, including `YasiHand-*` |

Each page carries its own inline `<style>` block for page-specific rules and pulls shared
tokens/layout from `css/style.css`. Colors and fonts come from CSS variables (`--ink`,
`--ink2`…`--ink4`, `--highlight`, `--link`, `--link-soft`, `--link-hover`, `--hand`, `--serif`, `--body`) — use those
rather than hardcoding values.

Three typefaces, each with one job: `--serif` (Libre Caslon Display) is for h1/h2 **only**. It
ships a single 400 weight and is too thin at small sizes, so never give it `font-weight` 500+.
`--body` (Newsreader) is for prose, titles, and list dates/meta (italic, old-style figures).
`--hand` (YasiHand) is for handwritten accents and tabs. `--mono` (IBM Plex Mono) is kept, by
preference, for the homepage nav and social links and for the project/research output pills,
tags and project years. Pages using it preload `ibm-plex-mono-400.woff2`.

On mobile, keep body copy at ≥1rem and small meta at ≥0.72rem. Don't shrink type to fit phones.

## Adding a photo

The gallery lives only on `photography.html`. `projects.html#photography` redirects there.


1. Drop the image in `photos/`.
2. Add the filename to `photos/manifest.json` by hand — there is no generator, and the
   directory is never listed at runtime. A file not in the manifest simply won't appear.

Filenames follow `title, location - year.ext`, e.g. `still water, kyoto, japan - 2026.jpeg`.
The parser splits the trailing year, then treats everything before the first comma as the title
and everything after as the location.

**Captions display only `location, year`** (small italic, `.polaroid-meta`). The title portion of
the filename survives only as the image `alt` text — keep writing descriptive titles, they just
aren't rendered. The parsed filename is `.trim()`ed, so a stray space before the extension
won't break year detection.

Use JPEG. Do not convert to WebP.

## about.html margin annotations

The handwritten marginalia are absolutely positioned outside the 640px text column, and the
photo in paragraph 1 is a right float — so **editing the prose reflows the text and can strand
a note away from the word it points at**. Re-render and look at the page after any copy change
there.

Notes that must stay level with a specific word carry `data-anchor="<id>"` pointing at an inline
span wrapping that word; a small script at the end of the file sets their `top` from the anchor's
line box on load, after fonts settle, and on resize. Horizontal placement stays in CSS
(`left: 100%` for the right margin, negative `left` for the left margin). To add one, wrap the
target word in a span with an id and give the note a matching `data-anchor` — do not hand-tune a
pixel offset, that is exactly what breaks on reflow.

The remaining notes (`.margin-note`, `.margin-note-left`) still use fixed `top` offsets in `em`
relative to their paragraph and are not anchored. All margin notes hide below 920px, where there
is no margin left to hold them.

## Adding a project card

Copy an existing `.project-card` in `projects.html` (header, desc, footer with
`.project-outputs` and `.project-card-tags`). Cards sit inside a `<section class="project-year">`
whose `.project-year-label` h2 carries the year — add to the matching year's section, or create a
new section in newest-first order. The hand-drawn timeline rail in the left margin, its dots, and
the year labels' vertical position are all computed by the script at the end of the page from the
card titles, so nothing needs hand positioning. Below 920px the rail hides and years become inline
handwritten headings.

Output links carry `data-type` (`website` / `repo` / `paper` / `poster`), which drives the
colored dot. Tags carry `data-kind` (`lang` / `subject`).

## Adding a writing or research entry

Use the shared `.entry` pattern (`entry-title` > `a`, `entry-desc`, `entry-meta`) inside the
relevant tab container — `.writing-section` in `writing.html`, `.research-section` in
`research.html`. Entries are newest-first; `entry-meta` is a short date like `Aug 2026`.

## Tabbed pages

`research.html` and `writing.html` load the shared `js/tabs.js`. A `.section-tabs[role=tablist]`
holds `.section-tab[role=tab][data-section][aria-controls]` buttons, and each panel is the element
with that id plus `role="tabpanel"`. The script toggles `.active` + `aria-selected`, supports
arrow keys, and mirrors the open tab into the URL hash, so `/writing.html#baseball` both opens
and shares that tab. Tab styling (handwritten label + highlighter swipe) lives in
`css/style.css`. Don't restyle it per page.

## New pages

Copy the `<head>` boilerplate from an existing page — it is repeated per page, not templated:
the inline Google Analytics tag, `<title>`, description, OpenGraph + Twitter card meta, favicon,
four font `<link rel="preload">` tags, then `css/style.css`. Also add the page to `sitemap.xml`.

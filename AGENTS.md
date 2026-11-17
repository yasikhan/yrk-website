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
| `research.html` | Research, writing, and analysis, filed into a Democracy / AI / Analytics Venn diagram drawn by `js/venn.js` |
| `portfolio.html` | Landing page offering two choices, websites or photography, each shown as a stack that fans out on hover |
| `websites.html` | Website-design cards, each screenshot in a hand-drawn browser frame |
| `photography.html` | Photo gallery |
| `contact.html` | Links |
| `writing.html`, `projects.html` | Redirect stubs to `research.html` / `websites.html`, mapping old `#tab` hashes. Keep them so old links work |
| `js/nav.js` | Header menu dropdown (three-line button) on content pages |
| `js/frames.js` | Draws the sketched browser frame around every `.site-frame` screenshot (websites, portfolio) |
| `css/style.css` | The only shared stylesheet: `:root` design tokens, content-page layout, `.entry` lists, footer, responsive rules |
| `photos/` | Gallery images + `manifest.json` |
| `assets/img/sites/` | Screenshots for the website cards (960×600 JPEG) |
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

The gallery lives on `photography.html`. `projects.html#photography` redirects there.


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

## Research (the Venn diagram)

`research.html` lists every piece of work inside a `<section class="region-group"
data-region="…">`. The seven regions are `all-three`, `democracy-ai`, `democracy-analytics`,
`ai-analytics`, `democracy`, `ai`, `analytics`. Within a region, a piece is either a standalone
`.entry` or part of an `.entry-group`. A group is a named body of work (the Deliberative Democracy
Lab polls, McCovey Chronicles…) with a `.group-head` and optional `.group-desc`, and its entries
are indented beneath it.

`js/venn.js` reads that list and draws everything from it. The circles are plain pencil outlines.
A standalone entry becomes one dot; a group becomes a tight huddle of dots with a pencil loop
around it, named underneath in handwriting from the group's `data-short` attribute. The name wraps
to two lines if needed, or is dropped if it can't fit inside the region. Marks are placed at
seeded positions (the same every load), largest first, with room from the circle edges and from
each other. Nothing is hand-placed: **to add a piece, add an `.entry` to the right region group,
or inside an existing `.entry-group`.** For a new group, give it a short `data-short` name.

Entry pattern: `entry-title` (wrap in `a` if there's a primary link), `entry-desc`, optional
`<details class="abstract"><summary>abstract</summary><p>…</p></details>`, optional
`.entry-outputs` pills (`a.entry-output[data-type]`: `paper` / `pdf` / `journal` / `talk` /
`presentation` / `award` / `website` / `repo`, which color the dot). `entry-meta` reads `kind, date`,
e.g. `essay, Aug 2026`. Use commas, not middle dots. Newest-first.

Type filters sit above the list: papers, talks, essays, articles, polls, projects. An entry's
type comes from the first word of its `entry-meta` (`KINDS` in `js/venn.js` maps `thesis`, `paper`
and `research` to papers, `moderator` and `expert` to polls, `analysis` and `project` to
projects), so a new kind word needs adding there. A type and a region combine, and a type with
nothing in the picked region is disabled. The hash holds either or both: `#papers`, `#ai+papers`.

Selecting a region also brings in every region that sits inside all of its circles: `ai` shows ai,
democracy & ai, ai & analytics, and the center; `democracy-ai` shows that lens plus the center.
Those regions fill with the `--highlight` wash (hover previews the same set), the list filters to
them, starting with the region picked, and the pick is mirrored to the hash
(`/research.html#analytics`) so links are shareable.

## Adding a website

Copy an `article.site` in `websites.html`. It holds an `a.site-frame` with `.site-url` and a
screenshot in `assets/img/sites/`, then `.site-head`, `.site-desc`, and `.site-foot` with
`.entry-outputs` and `.project-card-tags` (`data-kind` `lang` / `subject`). The browser frame
around the screenshot is drawn by `js/frames.js` at runtime and resizes itself. Screenshots were taken
with headless Chrome at 1280×800 and saved as 960px-wide JPEG. Newest-first.

## New pages

Copy the `<head>` boilerplate from an existing page — it is repeated per page, not templated:
the inline Google Analytics tag, `<title>`, description, OpenGraph + Twitter card meta, favicon,
four font `<link rel="preload">` tags, then `css/style.css`. Also add the page to `sitemap.xml`.

Content pages share a header: `nav.content-nav` with the `← homepage` link on the left and a
`menu` dropdown (`.page-menu`) on the right listing every page, with `aria-current="page"` on the
current one. Websites and Photography sit under Portfolio as `<li class="sub">` items.
`js/nav.js` (loaded just before `</body>`) handles open/close. The menu list is
repeated in each page — when adding a page, add it to every page's list.

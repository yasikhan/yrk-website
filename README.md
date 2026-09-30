# yrkhan.com

Personal website for Yasmeena Khan — hand-illustrated bookshelf UI, custom typography, and sketch-style navigation. Built with static HTML, CSS, and vanilla JavaScript.

Live at [yrkhan.com](https://yrkhan.com).

## Running locally

No build step and no dependencies. Serve the directory over HTTP:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly with `file://` mostly works, but the photo gallery will come up empty — they fetch `photos/manifest.json`, which the `file://` origin blocks.

## Structure

```
index.html          landing page — bookshelf drawn on <canvas>
about.html          about, with handwritten margin notes
research.html       academic and professional research
writing.html        essays and baseball writing
projects.html       technical projects
photography.html    photo gallery
contact.html        links

css/style.css       shared design tokens and layout
js/shelf.js         bookshelf illustration
js/tabs.js          tab switching for research and writing
js/rough.js         rough.js, vendored
assets/img/         images — photos, sketches, logo, favicon
assets/docs/        PDFs — resume, papers, posters
assets/fonts/       self-hosted fonts
photos/             gallery images + manifest.json
```

Each page has its own inline `<style>` block for page-specific rules on top of the shared stylesheet.

## Updating content

**Photos** — add the image to `photos/`, then add its filename to `photos/manifest.json`; the gallery reads that list and won't pick up files that aren't in it. Name files `title, location - year.jpeg`. Captions show the location and year; the title becomes the image's alt text.

**Projects and writing** — copy the nearest existing card or `.entry` block in the relevant page and edit it in place. Both lists are ordered newest-first.

## Deployment

GitHub Pages serves from `main`, with the domain set by `CNAME`. Pushing to `main` publishes the site.

---

Built with assistance from [Claude](https://claude.ai).

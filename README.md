# yrkhan.com

Personal website for Yasmeena Khan — hand-illustrated bookshelf UI, custom typography, and sketch-style navigation. Built with static HTML, CSS, and vanilla JavaScript.

Live at [yrkhan.com](https://yrkhan.com).

## Running locally

No build step and no dependencies. Serve the directory over HTTP:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly with `file://` mostly works, but the photo galleries will come up empty — they fetch `photos/manifest.json`, which the `file://` origin blocks.

## Structure

```
index.html          landing page — bookshelf drawn on <canvas>
about.html          about, with handwritten margin notes
research.html       academic and professional research
writing.html        essays and baseball writing
projects.html       technical projects and photography
photography.html    photo gallery
contact.html        links

css/style.css       shared design tokens and layout
js/shelf.js         bookshelf illustration
js/rough.js         rough.js, vendored
assets/             images, PDFs, self-hosted fonts
photos/             gallery images + manifest.json
```

Each page has its own inline `<style>` block for page-specific rules on top of the shared stylesheet.

## Updating content

**Photos** — add the image to `photos/`, then add its filename to `photos/manifest.json`; the gallery reads that list and won't pick up files that aren't in it. Name files `title, location - year.jpeg`. Captions show the location and year; the title becomes the image's alt text.

**Projects and writing** — copy the nearest existing card or `.entry` block in the relevant page and edit it in place. Both lists are ordered newest-first.

Note that `photography.html` and the Photography tab of `projects.html` each carry their own copy of the gallery code, so gallery changes need to be made in both.

## Deployment

GitHub Pages serves from `main`, with the domain set by `CNAME`. Pushing to `main` publishes the site.

---

Built with assistance from [Claude](https://claude.ai).

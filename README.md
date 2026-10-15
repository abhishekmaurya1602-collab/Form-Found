# Form & Found

An independent design archive connecting 18 classic objects and information designs with seven makers. The masonry gallery leads from an object to its designer, their other work, and curatorial connections to other makers.

## Run locally

No build or installation is required:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. GitHub Pages serves this directory directly from `codex/gallery-redesign`.

## Explore

- Each gallery card credits its maker; collaborative credits appear with the work.
- Object stories link to maker profiles, more work by the same maker, and related makers.
- The Makers view offers a second entry into the collection.
- An exploration trail and browser Back/Forward preserve the object → maker → work journey.
- Shareable URLs use `#object/eames-lcw` and `#maker/eames`; they work on GitHub Pages without server routing.
- Search matches names, collaborators, materials, descriptions and years. Categories, palette/material filters, chronology, shuffle and gallery density remain available.
- Saved objects (`form-found-saved`) and followed makers (`form-found-followed`) persist in localStorage. My collection contains both. Storage failures preserve the experience for the current visit.
- Native dialogs provide focus containment and Escape support. Reduced motion and keyboard navigation are supported.

## Accessibility

The implementation targets WCAG 2.2 Level AA. See the [accessibility information](accessibility.html) and [assessment notes](ACCESSIBILITY.md) for scope, measured contrast, and the outstanding manual checks. Automated checks alone do not establish conformance.

Keyboard access includes a skip link, visible focus, Control/Command + K search, dialog headings and focus restoration, persistent status messages, and explicit loading of more stories. Gallery controls remain available on narrow screens.

Development checks use Node.js 24.15 or later:

```sh
npm ci
npm test
npm run test:axe
```

These are development-only dependencies; the production website remains static and needs no installation or build. The axe audit runs in JSDOM, with rendered color-contrast checking disabled. A separate regression check calculates the authored palette's contrast ratios. Real-browser and assistive-technology testing remains necessary.

## Content and images

`products.js` holds the object records, maker profiles, archival source links, and editorial connections. Connections suggest comparisons; they do not assert historical influence.

Photographs are optimized local WebP files. Source authors, licenses and changes are documented in [image credits](assets/classics/credits.html) and [machine-readable credits](assets/classics/credits.json). Three original diagram/interface studies are labeled as studies, rather than archival reproductions. Dates refer to designs, while photographs may show later editions. Detailed captions identify those distinctions.

DM Sans is distributed under the SIL Open Font License in [assets/fonts/OFL.txt](assets/fonts/OFL.txt).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabhishekmaurya1602-collab%2FForm-Found%2Ftree%2Fcodex%2Fgallery-redesign&project-name=form-found&repository-name=form-found-vercel)

The button copies the current `codex/gallery-redesign` branch into a new repository and creates a Vercel project. Sign in, choose an account and repository name, then select Deploy. No environment variables or build step are required. `vercel.json` serves the project root as a static website.

To deploy this same GitHub repository instead of creating a copy:

1. Open <https://vercel.com/new> and import `abhishekmaurya1602-collab/Form-Found`.
2. Select Framework Preset **Other**. Leave the root directory at the repository root, leave Build Command and Install Command empty, and set Output Directory to `.`. The checked-in configuration supplies these settings.
3. Set the project's production branch to `main` in Settings → Environments → Production → Branch Tracking, then deploy that branch. The live project at <https://form-found.vercel.app/> tracks `main`; `codex/gallery-redesign` is kept in sync for GitHub Pages.
4. Open the production URL Vercel returns. Test an object and maker link, such as `/#maker/eames`, and the Sources & credits links.

Hash-based exploration links work on both Vercel and GitHub Pages without special routing. Future pushes to the selected production branch automatically deploy through the Vercel Git integration.

## Maker portraits

Authentic portraits appear on the maker cards, profiles, object bylines, and related-maker links. The Apple profile names Susan Kare and Jonathan Ive as selected contributors from different periods, rather than representing one person as the entire team. Sources, authors and license information are in [portrait credits](assets/portraits/credits.html). Historical archival portraits retain their original copyright; no open license is asserted for those images.

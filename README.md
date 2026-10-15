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

## Content and images

`products.js` holds the object records, maker profiles, archival source links, and editorial connections. Connections suggest comparisons; they do not assert historical influence.

Photographs are optimized local WebP files. Source authors, licenses and changes are documented in [image credits](assets/classics/credits.html) and [machine-readable credits](assets/classics/credits.json). Three original diagram/interface studies are labeled as studies, rather than archival reproductions. Dates refer to designs, while photographs may show later editions. Detailed captions identify those distinctions.

DM Sans is distributed under the SIL Open Font License in [assets/fonts/OFL.txt](assets/fonts/OFL.txt).

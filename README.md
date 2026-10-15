# Form & Found

A responsive discovery gallery of 37 photographed products and everyday objects. Browse a masonry feed, filter by category, palette or material, search, shuffle the collection, and save favorites in your browser.

## Run locally

No installation or build step is required. From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the server in a browser. Any static host, including GitHub Pages, can serve the site directly.

## How it works

- `index.html`, `styles.css`, and `app.js` implement the gallery.
- `products.js` contains the catalog. Add a unique ID and a local image to extend it.
- The feed starts with 16 products and appends batches of 12 as you scroll. It stops at the end of the catalog without duplicating products. A “More good things” button also loads the next batch.
- Saved IDs are stored under `form-found-saved` in localStorage. They remain on the same browser; there is no account or backend.
- All product images and the font are local, so the gallery works without external image or font services.
- Native dialogs support keyboard focus management and Escape. Press `/` outside an input to focus search. Reduced-motion preferences are respected.

## Images and font

Photographs are sourced from the Woodex, Footcap, and Bedimcode image collections. Full source URLs and provenance notes are in [assets/image-credits.json](assets/image-credits.json). Editorial titles describe the pictured objects; they are not verified manufacturer model names. Original image rights should be checked before commercial distribution.

DM Sans is distributed under the SIL Open Font License in [assets/fonts/OFL.txt](assets/fonts/OFL.txt).

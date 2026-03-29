# Icon Font Generator

Convert SVG icons into a web font. Includes a built-in preview app to browse, search, and copy icon snippets.

Supports both **filled** and **stroke/outline** SVGs — stroke paths are automatically converted to fills during font generation.

## Quick Start

```bash
# Install dependencies
yarn install

# Generate the font from SVGs
yarn svg:all

# Start the preview app
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to browse your icons.

## How It Works

### Adding Icons

1. Drop your `.svg` files into the `icons/` directory
2. Run `yarn svg:all`
3. Done — your font is generated at `public/fonts/<version>/`

The filename becomes the icon class name:

```
icons/arrow-left.svg  →  icon-font-arrow-left
icons/home.svg        →  icon-font-home
```

### Using Icons

```html
<!-- HTML -->
<i class="icon-font-home"></i>

<!-- React/JSX -->
<i className="icon-font-home"></i>
```

Include the generated CSS in your project:

```html
<link rel="stylesheet" href="/fonts/<version>/icon-font.css" />
```

Or fetch it programmatically from the `/generate` endpoint when running the preview app.

### Versioning

The font output path is tied to the `version` field in `package.json`:

```
public/fonts/1.0.13/icon-font.css
public/fonts/1.0.13/icon-font.woff2
...
```

Bump the version before generating a new release to avoid cache issues.

## Font Generation Pipeline

`yarn svg:all` runs a multi-step pipeline:

1. **Optimize** — Cleans up SVGs with [SVGO](https://github.com/svg/svgo)
2. **Stroke to Fill** — Converts stroke-based outlines to filled paths using [svg-outline-stroke](https://github.com/nicholasgasior/svg-outline-stroke) (each subpath is processed independently for correct rendering)
3. **Fix Winding** — Adjusts path winding directions for font compatibility (non-zero fill rule)
4. **Generate Font** — Creates the font files (woff, woff2, ttf, eot, svg) and CSS with [svgtofont](https://github.com/nicholasgasior/svgtofont)

Original SVG files in `icons/` are **never modified** — all processing happens on temporary copies.

## Preview App

The built-in Next.js app lets you:

- Browse all icons in a searchable grid
- Copy `<i>` tag or JSX component snippet to clipboard
- See the total icon count

## Commands

| Command | Description |
|---------|-------------|
| `yarn svg:all` | Run the full font generation pipeline |
| `yarn dev` | Start the preview app (dev mode) |
| `yarn build` | Production build |
| `yarn start` | Start production server (port 3001) |
| `yarn lint` | Run ESLint |

## Project Structure

```
icons/              ← Source SVGs (drop your icons here)
scripts/
  generate-font.js  ← Font generation pipeline
public/fonts/       ← Generated font files (gitignored)
src/
  pages/
    index.js        ← Preview app (search + copy)
    generate.js     ← CSS endpoint for consumers
  utils/
    index.js        ← JSX template generator
.svgtofontrc.js     ← Font name and output config
```

## License

MIT

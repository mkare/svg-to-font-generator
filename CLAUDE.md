# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

icon-font-generator converts SVG icons into a web font (`icon-font`) and provides a Next.js preview app for browsing/searching icons and copying usage snippets. Supports both filled and stroke/outline SVGs.

## Key Commands

- `yarn svg:all` — full pipeline: optimize → stroke-to-fill → fix winding → generate font (outputs to `public/fonts/<version>/`)
- `yarn dev` — run the Next.js dev server
- `yarn build` — production build
- `yarn start` — start production server on port 3001
- `yarn lint` — run ESLint

## Icon Workflow

1. Place SVG files in `icons/` (filenames become class names: `home.svg` → `icon-font-home`)
2. Run `yarn svg:all` to generate the font
3. Run `yarn dev` to verify icons render correctly
4. Bump version in `package.json` before releases (determines font output path)

## Architecture

- **`icons/`** — source SVGs, never modified by the pipeline
- **`scripts/generate-font.js`** — font generation pipeline: copies SVGs to `.tmp-icons/`, optimizes with SVGO, converts strokes to fills (each subpath independently via svg-outline-stroke), fixes winding directions for non-zero fill rule, generates font via svgtofont, cleans up temp dir
- **`.svgtofontrc.js`** — svgtofont config: font name `icon-font`, output path from package.json version
- **`src/pages/index.js`** — preview page: reads SVG filenames at build time, renders searchable grid with copy-to-clipboard
- **`src/pages/generate.js`** — returns raw CSS with `.icon-font-*` class rules for consumers
- **`src/utils/index.js`** — `getJSX()` generates React component template

## Important Notes

- Original SVGs are never modified — pipeline works on copies in `.tmp-icons/`
- Font version path is derived from `package.json` version
- Stroke-based SVGs are split into individual subpaths before stroke-to-fill conversion to prevent enclosed areas from being filled solid

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const outlineStroke = require('svg-outline-stroke');
const {
  splitPath,
  getDrawDirection,
  getPathBBox,
  reversePath,
  pathToString,
  parsePathString
} = require('svg-path-commander');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'icons');
const TMP_DIR = path.join(ROOT, '.tmp-icons');

// Collect icons from flat files and subdirectories, flatten into .tmp-icons/
function collectIcons() {
  if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR);

  const seen = new Set();
  let count = 0;

  function addFile(srcPath, fileName) {
    if (seen.has(fileName)) {
      throw new Error(
        `Duplicate icon filename: ${fileName} (icon names must be unique across all groups)`
      );
    }
    seen.add(fileName);
    fs.copyFileSync(srcPath, path.join(TMP_DIR, fileName));
    count++;
  }

  const entries = fs.readdirSync(ICONS_DIR, { withFileTypes: true });

  // Flat SVGs
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.svg')) {
      addFile(path.join(ICONS_DIR, e.name), e.name);
    }
  }

  // Subdirectories
  for (const e of entries) {
    if (e.isDirectory()) {
      const dirPath = path.join(ICONS_DIR, e.name);
      const svgs = fs.readdirSync(dirPath).filter((f) => f.endsWith('.svg'));
      for (const svg of svgs) {
        addFile(path.join(dirPath, svg), svg);
      }
    }
  }

  console.log(`[1/4] Collected ${count} SVGs to .tmp-icons/`);
}

function optimize() {
  execSync(`npx svgo -f ${TMP_DIR} -o ${TMP_DIR}`, { stdio: 'inherit' });
  console.log('[2/4] SVGs optimized');
}

// Convert each stroke subpath independently, then fix winding per-result
// and write as a single combined <path>.
async function strokeToFill() {
  const files = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith('.svg'));
  let converted = 0;

  for (const file of files) {
    const filePath = path.join(TMP_DIR, file);
    const svg = fs.readFileSync(filePath, 'utf8');
    if (!svg.includes('stroke')) continue;

    try {
      const svgAttrs = svg.match(/<svg([^>]*)>/)[1];
      const pathMatch = svg.match(/\sd="([^"]+)"/);
      if (!pathMatch) continue;

      const d = pathMatch[1];
      const subPathStrings = d.split(/(?=M)/).filter((s) => s.trim());

      // Convert each subpath independently, fix winding per result
      const allFixedPaths = [];

      for (const subD of subPathStrings) {
        const subSvg = `<svg${svgAttrs}><path d="${subD}" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        try {
          const result = await outlineStroke(subSvg, { color: '#000000' });
          const fillDMatch = result.match(/\sd="([^"]+)"/);
          if (!fillDMatch) continue;

          // Each stroke-to-fill result is a self-contained compound shape
          // (outer boundary + optional inner hole) with evenodd fill-rule.
          // Fix winding within this single result: outer→CW, inner→CCW.
          const fillD = fillDMatch[1];
          const parsed = parsePathString(fillD);
          const parts = splitPath(parsed);

          if (parts.length === 1) {
            // Simple shape, make it CW
            const cw = getDrawDirection(parts[0]);
            allFixedPaths.push(
              cw ? pathToString(parts[0]) : pathToString(reversePath(pathToString(parts[0])))
            );
          } else {
            // Compound shape: largest area = outer (CW), rest = holes (CCW)
            const areas = parts.map((sp) =>
              Math.abs(getPathBBox(pathToString(sp)).width * getPathBBox(pathToString(sp)).height)
            );
            const maxArea = Math.max(...areas);

            for (let i = 0; i < parts.length; i++) {
              const str = pathToString(parts[i]);
              const cw = getDrawDirection(parts[i]);
              const isOuter = areas[i] === maxArea;

              if (isOuter && !cw) {
                allFixedPaths.push(pathToString(reversePath(str)));
              } else if (!isOuter && cw) {
                allFixedPaths.push(pathToString(reversePath(str)));
              } else {
                allFixedPaths.push(str);
              }
            }
          }
        } catch (e) {
          // skip failed subpaths
        }
      }

      if (allFixedPaths.length > 0) {
        const combinedD = allFixedPaths.join(' ');
        // No fill-rule needed — winding is already fixed for non-zero
        const resultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><path d="${combinedD}"/></svg>`;
        fs.writeFileSync(filePath, resultSvg);
      }
      converted++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }
  console.log(`[3/4] Stroke-to-fill + winding: ${converted} files`);
}

function generateFont() {
  execSync(`npx svgtofont --sources ${TMP_DIR} --output ./public/fonts`, {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log(`[4/4] Font generated`);
}

function cleanup() {
  fs.rmSync(TMP_DIR, { recursive: true });
}

async function main() {
  try {
    collectIcons();
    optimize();
    await strokeToFill();
    generateFont();
  } finally {
    cleanup();
  }
  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// main.ts — hands the GTA 6 trophy guide in.
// Node 22, standard library only. Copies app/ and screenshots/ from this
// repository into the output directory and writes output/dossier.json
// with buildDossier from vendor/makefun-frontend.ts.
// Deterministic: the same repository always produces the same bytes.
// A missing screenshots/ folder is fine: the screenshots are real
// browser renders captured after the build, and main.ts must not fail
// without them.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyTreeSkippingDotfiles(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  const entries = readdirSync(sourceDir).sort();
  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    const sourcePath = join(sourceDir, entry);
    const targetPath = join(targetDir, entry);
    const info = statSync(sourcePath);
    if (info.isDirectory()) {
      copyTreeSkippingDotfiles(sourcePath, targetPath);
    } else if (info.isFile()) {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function buildGuide() {
  mkdirSync(outputDir, { recursive: true });
  copyTreeSkippingDotfiles(join(repoDir, "app"), join(outputDir, "app"));
  const screenshotsDir = join(repoDir, "screenshots");
  if (existsSync(screenshotsDir)) {
    copyTreeSkippingDotfiles(screenshotsDir, join(outputDir, "screenshots"));
  }
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
}

buildGuide();

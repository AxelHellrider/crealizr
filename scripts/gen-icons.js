#!/usr/bin/env node
// One-off generator: rasterizes the brand favicon mark into the PWA manifest
// icons (icon-192.png / icon-512.png), replacing the old placeholder "CR"
// icons. Run manually (`node scripts/gen-icons.js`) whenever the favicon
// mark changes; output is committed like any other static asset.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const GOLD = "#c5a059";
const BG = "#0f0f13";

const favicon = fs.readFileSync(path.join(__dirname, "../public/crealizr_favicon.svg"), "utf8");
const markSvg = favicon.replace(/currentColor/g, GOLD);

async function renderIcon(size, outPath) {
    // The mark's viewBox is a wide 120x70 region; pad it onto a square
    // canvas with generous margin so it survives OS maskable-icon cropping
    // (circle/squircle) without clipping the logo.
    const markSize = Math.round(size * 0.62);
    const markBuffer = await sharp(Buffer.from(markSvg), { density: 384 })
        .resize(markSize, Math.round(markSize * (70 / 120)), { fit: "contain" })
        .png()
        .toBuffer();

    const markMeta = await sharp(markBuffer).metadata();

    await sharp({
        create: { width: size, height: size, channels: 4, background: BG },
    })
        .composite([
            {
                input: markBuffer,
                left: Math.round((size - (markMeta.width ?? markSize)) / 2),
                top: Math.round((size - (markMeta.height ?? markSize)) / 2),
            },
        ])
        .png()
        .toFile(outPath);
}

(async () => {
    const iconsDir = path.join(__dirname, "../public/icons");
    await renderIcon(192, path.join(iconsDir, "icon-192.png"));
    await renderIcon(512, path.join(iconsDir, "icon-512.png"));
    console.log("Generated icon-192.png and icon-512.png from crealizr_favicon.svg");
})();

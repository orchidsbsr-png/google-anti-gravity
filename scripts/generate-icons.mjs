// Rasterizes the framed seal (icon-source.svg) into the PWA / touch
// icons. Note: public/logo.svg is the BORDERLESS tab favicon (YouTube
// style, transparent) — app icons need the framed version with a
// background, which lives in public/icons/icon-source.svg.
// Run after changing the logo:  node scripts/generate-icons.mjs
import sharp from 'sharp';

const SRC = 'public/icons/icon-source.svg';

const targets = [
    { file: 'public/icons/icon-192.png', size: 192 },
    { file: 'public/icons/icon-512.png', size: 512 },
    { file: 'public/icons/apple-touch-icon.png', size: 180 },
];

for (const { file, size } of targets) {
    await sharp(SRC, { density: 512 })
        .resize(size, size)
        .png()
        .toFile(file);
    console.log(`✓ ${file} (${size}x${size})`);
}

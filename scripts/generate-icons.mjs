// Rasterizes public/logo.svg into the PWA / touch icons.
// Run after changing the logo:  node scripts/generate-icons.mjs
import sharp from 'sharp';

const SRC = 'public/logo.svg';

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

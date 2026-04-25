import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outputDir = resolve(projectRoot, 'public/icons');

const inputImage = process.argv[2] || resolve(projectRoot, 'public/reclub.png');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`Generating icons from: ${inputImage}`);

for (const size of sizes) {
  const outputPath = resolve(outputDir, `icon-${size}x${size}.png`);
  await sharp(inputImage)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 179, g: 83, b: 148, alpha: 1 }
    })
    .png()
    .toFile(outputPath);
  console.log(`  ✓ icon-${size}x${size}.png`);
}

console.log(`\nDone! Icons saved to public/icons/`);
console.log(`\nTo use your own image, run:`);
console.log(`  node scripts/generate-icons.mjs path/to/your-image.png`);

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512];
const MASTER_ICON = 'public/logo.png';
const OUTPUT_DIR = 'public/icons';
const THEME_COLOR = '#5C3B2E';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function generateIcons() {
  // Generate standard icons
  for (const size of SIZES) {
    await sharp(MASTER_ICON)
      .resize(size, size)
      .toFile(path.join(OUTPUT_DIR, `icon-${size}.png`));
  }

  // Generate maskable icon
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.2); // 20% padding
  const innerSize = maskableSize - (padding * 2);

  const resizedMaster = await sharp(MASTER_ICON)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: THEME_COLOR
    }
  })
  .composite([{ input: resizedMaster, gravity: 'center' }])
  .toFile(path.join(OUTPUT_DIR, 'icon-512-maskable.png'));

  console.log('Icons generated successfully.');
}

generateIcons().catch(console.error);

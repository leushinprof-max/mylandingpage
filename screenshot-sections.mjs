import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'section';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportH = 900;
  let i = 1;
  for (let y = 0; y < totalHeight; y += viewportH) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await new Promise(r => setTimeout(r, 300));
    const filename = `screenshot-${label}-${i}.png`;
    await page.screenshot({ path: path.join(dir, filename), clip: { x: 0, y: y, width: 1440, height: Math.min(viewportH, totalHeight - y) } });
    console.log(`Saved: temporary screenshots/${filename}`);
    i++;
  }
  await browser.close();
})();

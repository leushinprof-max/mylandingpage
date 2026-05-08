import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'how-full';

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}-${label}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const box = await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector('.how');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height };
  });
  await new Promise(r => setTimeout(r, 1500));
  if (box) {
    await page.screenshot({ path: path.join(dir, filename), captureBeyondViewport: true, clip: { x: 0, y: box.y, width: box.w, height: box.h } });
  } else {
    await page.screenshot({ path: path.join(dir, filename) });
  }
  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();

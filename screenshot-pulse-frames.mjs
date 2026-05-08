import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
let next = (nums.length ? Math.max(...nums) : 0) + 1;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector('.how');
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top + 200);
  });
  await new Promise(r => setTimeout(r, 200));
  // Verify the pseudo-element exists and has animation
  const info = await page.evaluate(() => {
    const line = document.querySelector('.spine-line');
    if (!line) return 'no spine-line';
    const lineRect = line.getBoundingClientRect();
    const style = window.getComputedStyle(line, '::after');
    return {
      lineRect: { x: lineRect.x, y: lineRect.y, width: lineRect.width, height: lineRect.height },
      pseudoTop: style.top,
      pseudoHeight: style.height,
      pseudoOpacity: style.opacity,
    };
  });
  console.log('::after computed:', JSON.stringify(info));
  for (let i = 0; i < 4; i++) {
    const filename = `screenshot-${next + i}-pulse-frame${i}.png`;
    await page.screenshot({ path: path.join(dir, filename) });
    console.log(`Saved: ${filename}`);
    await new Promise(r => setTimeout(r, 600));
  }
  await browser.close();
})();

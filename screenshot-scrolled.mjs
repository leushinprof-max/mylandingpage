import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const scrollOffset = parseInt(process.argv[3] || '300', 10);  // additional scroll within section
const label = process.argv[4] || ('scrolled-' + scrollOffset);

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}-${label}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate((delta) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector('.how');
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top + delta);
  }, scrollOffset);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(dir, filename) });
  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();

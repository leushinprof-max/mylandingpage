import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const selector = process.argv[3] || '.how';
const label = process.argv[4] || 'section';

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}-${label}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Pre-scroll through whole page to trigger all IntersectionObserver reveals
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const total = document.body.scrollHeight;
    for (let y = 0; y <= total; y += 600) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));

  // Now scroll to target selector and capture viewport
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 60);
    }
  }, selector);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(dir, filename) });
  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();

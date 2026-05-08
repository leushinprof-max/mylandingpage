import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'pricing';
const w = parseInt(process.argv[4] || '2560', 10);
const h = parseInt(process.argv[5] || '1440', 10);

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}-${label}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Scroll the section into view
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById('how-link');
    if (el) el.scrollIntoView({behavior: 'instant', block: 'start'});
  });
  // wait for section reveal IO to fire and render
  await new Promise(r => setTimeout(r, 1500));
  // verify
  const sy = await page.evaluate(() => window.scrollY);
  console.log('scrollY after:', sy);
  await page.screenshot({ path: path.join(dir, filename) });
  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();

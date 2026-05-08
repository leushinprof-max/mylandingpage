import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'hero';

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}-${label}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // move mouse to upper-right of hero so spotlight is visible
  const mx = parseInt(process.argv[4] || '1100', 10);
  const my = parseInt(process.argv[5] || '350', 10);
  await page.mouse.move(mx, my);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(dir, filename), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();

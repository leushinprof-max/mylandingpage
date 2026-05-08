import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  // Scroll until step 2 is pinned
  // Step through several scroll positions to see line behavior
  const positions = [1700, 1720, 1740, 1750, 1780];
  const results = [];
  for (const pos of positions) {
    await page.evaluate((p) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, p);
    }, pos);
    await new Promise(r => setTimeout(r, 300));
    // Force a scroll event
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
    await new Promise(r => setTimeout(r, 200));
    const d = await page.evaluate(() => {
      const line = document.querySelector('.spine-line');
      const nodes = document.querySelectorAll('.step-node');
      return {
        lineTop: line.style.top,
        lineRectTop: line.getBoundingClientRect().top,
        n1Top: nodes[0].getBoundingClientRect().top,
        n1Bot: nodes[0].getBoundingClientRect().bottom,
        n1Op: nodes[0].style.opacity,
        n2Top: nodes[1].getBoundingClientRect().top,
        n2Bot: nodes[1].getBoundingClientRect().bottom,
      };
    });
    results.push({ scroll: pos, ...d });
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();

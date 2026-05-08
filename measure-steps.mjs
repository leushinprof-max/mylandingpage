import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const total = document.body.scrollHeight;
    for (let y = 0; y <= total; y += 600) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 400));
  const data = await page.evaluate(() => {
    const steps = [...document.querySelectorAll('.step')];
    return steps.map((s, i) => {
      const r = s.getBoundingClientRect();
      const title = s.querySelector('.step-title');
      const tr = title ? title.getBoundingClientRect() : null;
      const next = steps[i+1];
      const nr = next ? next.getBoundingClientRect() : null;
      return {
        i: i+1,
        title: title?.textContent.trim(),
        stepHeight: Math.round(r.height),
        titleTop: tr ? Math.round(tr.top + window.scrollY) : null,
        nextStepTop: nr ? Math.round(nr.top + window.scrollY) : null,
        gap_title_to_next: nr ? Math.round(nr.top - tr.top) : null,
      };
    });
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();

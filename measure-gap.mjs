import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const total = document.body.scrollHeight;
    for (let y = 0; y <= total; y += 600) { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); }
    window.scrollTo(0,0);
  });
  await new Promise(r=>setTimeout(r,400));
  const data = await page.evaluate(() => {
    const steps = [...document.querySelectorAll('.step')];
    return steps.map((s,i) => {
      const desc = s.querySelector('.step-desc');
      const visual = s.querySelector('.step-visual');
      const stage = s.querySelector('.step1-stage, .form-card, .tool-grid');
      const dr = desc?.getBoundingClientRect();
      const vr = visual?.getBoundingClientRect();
      const sr = stage?.getBoundingClientRect();
      // first child inside the visual stage
      const inner = stage?.firstElementChild;
      const ir = inner?.getBoundingClientRect();
      return {
        i: i+1,
        desc_bottom: dr ? Math.round(dr.bottom) : null,
        visual_top: vr ? Math.round(vr.top) : null,
        stage_top: sr ? Math.round(sr.top) : null,
        first_child_top: ir ? Math.round(ir.top) : null,
        gap_desc_to_visual: vr&&dr ? Math.round(vr.top - dr.bottom) : null,
        gap_desc_to_stage: sr&&dr ? Math.round(sr.top - dr.bottom) : null,
        gap_desc_to_inner: ir&&dr ? Math.round(ir.top - dr.bottom) : null,
      };
    });
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();

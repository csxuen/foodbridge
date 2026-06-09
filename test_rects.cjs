const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const receiverTab = tabs.find(b => b.textContent.includes('Receiver'));
    if (receiverTab) receiverTab.click();
  });
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  const rects = await page.evaluate(() => {
    const dashboard = document.querySelector('.bg-surface');
    const sidebar = document.querySelector('.bg-gradient-to-b');
    const toRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return { dashboard: toRect(dashboard), sidebar: toRect(sidebar) };
  });
  console.log('RECTS:', JSON.stringify(rects, null, 2));
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

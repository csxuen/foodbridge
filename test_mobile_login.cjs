const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 812 }); // Mobile viewport
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const receiverTab = tabs.find(b => b.textContent.includes('Receiver'));
    if (receiverTab) receiverTab.click();
  });

  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

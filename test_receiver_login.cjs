const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  
  console.log('Switching to Receiver tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const receiverTab = tabs.find(b => b.textContent.includes('Receiver'));
    if (receiverTab) receiverTab.click();
  });

  console.log('Logging in...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for URL to change...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Current URL:', page.url());
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  if (bodyHTML.includes('Receiver Overview')) {
      console.log('Dashboard rendered successfully.');
  } else {
      console.log('Dashboard text not found!');
  }
  
  await page.screenshot({ path: 'receiver_dashboard.png' });
  
  await browser.close();
})().catch(err => {
  console.error('SCRIPT ERROR:', err);
  process.exit(1);
});

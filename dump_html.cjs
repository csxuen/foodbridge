const puppeteer = require('puppeteer');
const fs = require('fs');

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
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('receiver_html_dump.html', bodyHTML);
  
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

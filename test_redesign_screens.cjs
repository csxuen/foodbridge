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
  await page.screenshot({ path: 'receiver_desktop_overview.png' });

  // Click Browse Food
  await page.evaluate(() => {
    const navs = Array.from(document.querySelectorAll('button'));
    const btn = navs.find(b => b.textContent.includes('Browse Food'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'receiver_desktop_browse.png' });

  // Click My Bookings
  await page.evaluate(() => {
    const navs = Array.from(document.querySelectorAll('button'));
    const btn = navs.find(b => b.textContent.includes('My Bookings'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'receiver_desktop_bookings.png' });

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  
  console.log('Logging in...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Current URL after login:', page.url());
  
  console.log('Clicking the logout button in header...');
  await page.evaluate(() => {
    // Let's just find the button with onClick={handleLogout} by looking at the parent of the log-out icon
    const icon = document.querySelector('svg.lucide-log-out');
    if (icon) {
      const btn = icon.closest('button');
      if (btn) btn.click();
      else console.log('Icon has no button parent');
    } else {
      console.log('Icon not found. Looking for text "Log Out"...');
      const allBtns = Array.from(document.querySelectorAll('button'));
      const logoutBtn = allBtns.find(b => b.innerText.includes('Log Out') || b.textContent.includes('Log Out'));
      if (logoutBtn) logoutBtn.click();
      else console.log('No button with text Log Out found either.');
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Current URL after clicking logout:', page.url());
  
  // Checking localstorage and user state implicitly via UI
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes('Log In')) {
    console.log('Navbar shows Log In button -> Logout successful');
  } else if (bodyText.includes('Dashboard')) {
    console.log('Navbar shows Dashboard button -> User still logged in');
  }
  
  await browser.close();
})().catch(err => {
  console.error('SCRIPT ERROR:', err);
  process.exit(1);
});

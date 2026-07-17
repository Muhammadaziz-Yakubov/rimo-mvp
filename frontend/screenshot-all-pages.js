const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = 'C:\\Users\\muham\\Desktop\\Rimo\\screenshots';

const dashboardPages = [
  { name: '03_dashboard', url: '/dashboard' },
  { name: '04_analytics', url: '/analytics' },
  { name: '05_api_activity', url: '/api-activity' },
  { name: '06_audit_logs', url: '/audit-logs' },
  { name: '07_authorities', url: '/authorities' },
  { name: '08_connections', url: '/connections' },
  { name: '09_integrations', url: '/integrations' },
  { name: '10_notifications', url: '/notifications' },
  { name: '11_organizations', url: '/organizations' },
  { name: '12_reports', url: '/reports' },
  { name: '13_settings', url: '/settings' },
  { name: '14_support', url: '/support' },
  { name: '15_tax_calculator', url: '/tax-calculator' },
  { name: '16_transactions', url: '/transactions' },
];

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function takeScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Force light mode (disable system dark mode preference)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  // ─── Step 1: Screenshot login page ───
  console.log('📸 01_home (login page)...');
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle2', timeout: 15000 });

  // Set localStorage theme to light and remove dark class from html
  await page.evaluate(() => {
    localStorage.setItem('soliqly-theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await wait(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_home.png'), fullPage: true });
  console.log('  ✅ Saved: 01_home.png');

  // ─── Step 2: Screenshot connect-government ───
  console.log('📸 02_connect_government...');
  await page.goto(BASE_URL + '/connect-government', { waitUntil: 'networkidle2', timeout: 15000 });
  await wait(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_connect_government.png'), fullPage: true });
  console.log('  ✅ Saved: 02_connect_government.png');

  // ─── Step 3: Perform login ───
  console.log('\n🔐 Logging in...');
  
  // Type username
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.click('#username');
  await page.type('#username', 'nigoraF3quVg9W', { delay: 50 });

  // Type password
  await page.click('#password');
  await page.type('#password', 'L6u1O0pAutIw6g8i', { delay: 50 });

  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await wait(2000);
    
    const currentUrl = page.url();
    console.log(`  ✅ Logged in! Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('connect-government')) {
      // Login failed, take screenshot of error
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_error.png'), fullPage: true });
      console.log('  ❌ Login failed, screenshot saved as 02_login_error.png');
      console.log('  Trying to read error message...');
      const errorText = await page.$eval('p.text-red-600, [role="alert"], .text-red-500', el => el.textContent).catch(() => 'No error message found');
      console.log('  Error:', errorText);
    }
  } catch (err) {
    console.log(`  ⚠️ Navigation timeout or error: ${err.message}`);
    const currentUrl = page.url();
    console.log(`  Current URL after login attempt: ${currentUrl}`);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_attempt.png'), fullPage: true });
  }

  // ─── Step 4: Screenshot all dashboard pages ───
  const currentUrl = page.url();
  if (!currentUrl.includes('connect-government')) {
    console.log('\n📸 Taking dashboard page screenshots...');
    for (const p of dashboardPages) {
      console.log(`📸 ${p.name} -> ${BASE_URL + p.url}`);
      try {
        await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await wait(2000);

        const finalUrl = page.url();
        const outputPath = path.join(OUTPUT_DIR, `${p.name}.png`);
        await page.screenshot({ path: outputPath, fullPage: true });

        const redirected = finalUrl !== BASE_URL + p.url;
        console.log(`  ✅ Saved: ${outputPath}${redirected ? ` (redirected to ${finalUrl})` : ''}`);
      } catch (err) {
        console.error(`  ❌ Error on ${p.name}: ${err.message}`);
      }
    }
  } else {
    console.log('\n❌ Still on login page, skipping dashboard screenshots.');
  }

  await browser.close();
  console.log(`\n📁 All screenshots saved to: ${OUTPUT_DIR}`);
}

takeScreenshots().catch(console.error);

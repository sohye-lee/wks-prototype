import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:3000');
await page.waitForSelector('input[aria-label="Password"]', { timeout: 5000 });
await page.fill('input[aria-label="Password"]', 'letmein');
await page.click('button[type="submit"]');
await page.waitForSelector('header', { timeout: 5000 });
await page.waitForTimeout(500);

// scroll inside the Home window to capture full content, section by section
const scrollArea = page.locator('div[role="dialog"][aria-label="Homepage"] > div').nth(1);
const total = await scrollArea.evaluate((el) => el.scrollHeight);
console.log('total scroll height', total);

let y = 0;
let i = 0;
while (y < total) {
  await scrollArea.evaluate((el, top) => { el.scrollTop = top; }, y);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `/tmp/wks-home-${i}.png` });
  y += 800;
  i++;
}

console.log('errors:', errors);
await browser.close();

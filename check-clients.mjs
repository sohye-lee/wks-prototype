import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:3000');
await page.waitForSelector('input[aria-label="Password"]', { timeout: 5000 });
await page.fill('input[aria-label="Password"]', 'letmein');
await page.click('button[type="submit"]');
await page.waitForSelector('header', { timeout: 8000 });
await page.waitForTimeout(1500); // let layout/images fully settle before measuring scrollHeight

await page.evaluate(() => {
  const heading = Array.from(document.querySelectorAll('h2')).find((h) =>
    h.textContent?.includes('keep quiet')
  );
  heading?.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(100);

const start = Date.now();
const points = [0, 200, 400, 600, 800, 1000, 1200, 1600, 2000, 2600, 8000, 16000];
for (const t of points) {
  const wait = t - (Date.now() - start);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `/tmp/wks-clients-${t}.png` });
}

console.log('errors:', errors);
await browser.close();

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.PORTFOLIO_BASE_URL;

if (!base) throw new Error('PORTFOLIO_BASE_URL is required');

await mkdir('public/portfolio', { recursive: true });

const shots = [
  { path: '/', viewport: { width: 1440, height: 1000 }, file: 'storefront-desktop.png' },
  { path: '/catalog', viewport: { width: 390, height: 844 }, file: 'catalog-mobile.png' },
  { path: '/demo-admin', viewport: { width: 1440, height: 1000 }, file: 'demo-admin-desktop.png' },
  { path: '/demo-admin/orders', viewport: { width: 390, height: 844 }, file: 'demo-admin-mobile.png' },
];

const browser = await chromium.launch();

try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: shot.viewport, deviceScaleFactor: 1 });
    const response = await page.goto(new URL(shot.path, base).href, { waitUntil: 'networkidle' });
    if (!response?.ok) throw new Error(`Portfolio capture failed for ${shot.path}: HTTP ${response?.status() ?? 'unknown'}`);
    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight, 400);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.screenshot({ path: `public/portfolio/${shot.file}`, fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
}

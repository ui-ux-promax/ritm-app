import { test, expect } from '@playwright/test';

// РЎС‚Р°С‚РёС‡РЅС‹Рµ legal-СЃС‚СЂР°РЅРёС†С‹ (Р±РµР· Р‘Р”) вЂ” РїСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ h1 РєР°Р¶РґРѕР№ СЂРµРЅРґРµСЂРёС‚СЃСЏ.
const pages: [string, RegExp][] = [
  ['/legal/privacy', /РџРѕР»РёС‚РёРєР° РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё/],
  ['/legal/terms', /РЈСЃР»РѕРІРёСЏ/],
  ['/legal/delivery', /Р”РѕСЃС‚Р°РІРєР°/],
  ['/legal/refund', /Р’РѕР·РІСЂР°С‚/],
];

for (const [path, heading] of pages) {
  test(`legal: ${path} СЂРµРЅРґРµСЂРёС‚СЃСЏ`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  });
}

test('С„СѓС‚РµСЂ РІРµРґС‘С‚ РЅР° legal: В«РЈСЃР»РѕРІРёСЏВ» в†’ /legal/terms', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('contentinfo').getByRole('link', { name: 'РЈСЃР»РѕРІРёСЏ' }).click();
  await expect(page).toHaveURL(/\/legal\/terms$/);
  await expect(page.getByRole('heading', { level: 1, name: /РЈСЃР»РѕРІРёСЏ/ })).toBeVisible();
});

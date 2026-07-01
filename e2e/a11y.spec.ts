import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registerAndVerify } from './helpers';

for (const path of ['/', '/catalog', '/product/ritm-white-tee-oversize', '/cart', '/wishlist', '/login', '/register', '/legal/privacy']) {
  test(`a11y: РЅРµС‚ СЃРµСЂСЊС‘Р·РЅС‹С… РЅР°СЂСѓС€РµРЅРёР№ РЅР° ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
  });
}

test('a11y: РЅРµС‚ СЃРµСЂСЊС‘Р·РЅС‹С… РЅР°СЂСѓС€РµРЅРёР№ РЅР° /checkout', async ({ page }) => {
  await registerAndVerify(page);
  await page.goto('/product/ritm-white-tee-oversize');
  await page.getByRole('button', { name: 'L', exact: true }).click();
  await page.getByRole('button', { name: /Р’ РєРѕСЂР·РёРЅСѓ/ }).click();
  await expect(page.getByRole('button', { name: /Р”РѕР±Р°РІР»РµРЅРѕ/ })).toBeVisible();

  await page.goto('/checkout');
  await expect(page.getByRole('button', { name: 'РћС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р· в†’' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
});

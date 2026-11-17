import { test, expect } from '../fixtures';
import { SortOption } from '../pages/inventoryPage';

const ASCENDING = 1;
const DESCENDING = -1;

const nameSorts: { option: SortOption; direction: number }[] = [
  { option: 'Name (A to Z)', direction: ASCENDING },
  { option: 'Name (Z to A)', direction: DESCENDING }
];

const priceSorts: { option: SortOption; direction: number }[] = [
  { option: 'Price (low to high)', direction: ASCENDING },
  { option: 'Price (high to low)', direction: DESCENDING }
];

// Expected orders are built from the page's own data rather than hard-coded, then checked
// with web-first assertions that retry until the list has finished re-rendering.
test.describe('Product sorting', { tag: ['@sorting', '@regression'] }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  for (const { option, direction } of nameSorts) {
    test(`sort products by ${option}`, async ({ inventoryPage }) => {
      const names = await inventoryPage.itemNames.allTextContents();
      const expected = [...names].sort((a, b) => direction * a.localeCompare(b));

      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemNames).toHaveText(expected);
    });
  }

  for (const { option, direction } of priceSorts) {
    test(`sort products by ${option}`, async ({ inventoryPage }) => {
      const prices = await inventoryPage.getPrices();
      const expected = [...prices].sort((a, b) => direction * (a - b)).map(price => `$${price.toFixed(2)}`);

      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemPrices).toHaveText(expected);
    });
  }
});

import { createBdd } from 'playwright-bdd';
import { expect, Page } from '@playwright/test';
import SauceDemoPage from '../pages/sauceDemoPage';
import PageUrls from '../support/urls';

const { Given, When, Then } = createBdd();

const getSaucePassword = (): string => process.env.SAUCE_PASSWORD || 'secret_sauce';

const addProductToCart = async (page: Page, productName: string): Promise<void> => {
  const productCard = page.locator(SauceDemoPage.inventoryItem).filter({
    has: page.locator(SauceDemoPage.inventoryItemName, { hasText: productName })
  });

  await expect(productCard, `Product not found in inventory: ${productName}`).toHaveCount(1);
  await productCard.locator(SauceDemoPage.addToCartButton).click();
};

Given(/^I open the SauceDemo login page$/, async ({ page }) => {
  await page.goto(PageUrls.sauceDemoPage());
  await expect(page.locator(SauceDemoPage.usernameInput)).toBeVisible();
});

When(/^I login to SauceDemo with user key "(.*)"$/, async ({ page }, userKey: string) => {
  const username = process.env[userKey];
  const password = getSaucePassword();

  if (!username) {
    throw new Error(`Missing environment variable for user key: ${userKey}`);
  }

  await page.fill(SauceDemoPage.usernameInput, username);
  await page.fill(SauceDemoPage.passwordInput, password);
  await page.click(SauceDemoPage.loginButton);
});

Then(/^I should be on the SauceDemo inventory page$/, async ({ page }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.locator(SauceDemoPage.inventoryList)).toBeVisible();
});

When(/^I add the following products to the cart:$/, async ({ page }, dataTable) => {
  const products = dataTable.hashes().map((row: { productName: string }) => row.productName);

  for (const productName of products) {
    await addProductToCart(page, productName);
  }
});

Given(/^I add "(.*)" to the cart$/, async ({ page }, productName: string) => {
  await addProductToCart(page, productName);
});

Then(/^the cart badge should show "(.*)"$/, async ({ page }, count: string) => {
  await expect(page.locator(SauceDemoPage.shoppingCartBadge)).toHaveText(count);
});

Then(/^I open the shopping cart$/, async ({ page }) => {
  await page.click(SauceDemoPage.shoppingCartLink);
  await expect(page).toHaveURL(/\/cart\.html$/);
});

Then(/^the cart should contain the following products:$/, async ({ page }, dataTable) => {
  const expectedProducts = dataTable.hashes().map((row: { productName: string }) => row.productName);
  const cartProductNames = await page.locator(SauceDemoPage.cartItemName).allTextContents();

  for (const expectedProduct of expectedProducts) {
    expect(cartProductNames).toContain(expectedProduct);
  }
});

When(/^I click continue shopping$/, async ({ page }) => {
  await page.click(SauceDemoPage.continueShoppingButton);
});

When(/^I select the "(.*)" sort option$/, async ({ page }, sortOption: string) => {
  await page.selectOption(SauceDemoPage.productSortDropdown, { label: sortOption });
});

Then(/^the inventory items should be in "(.*)" order$/, async ({ page }, expectedOrder: string) => {
  if (expectedOrder === 'ascending' || expectedOrder === 'descending') {
    const pricesRaw = await page.locator(SauceDemoPage.inventoryItemPrice).allTextContents();
    const prices = pricesRaw.map((price: string) => Number(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => a - b);

    if (expectedOrder === 'ascending') {
      expect(prices).toEqual(sortedPrices);
      return;
    }

    expect(prices).toEqual(sortedPrices.reverse());
    return;
  }

  if (expectedOrder === 'alphabetical') {
    const itemNames = await page.locator(SauceDemoPage.inventoryItemName).allTextContents();
    const sortedItemNames = [...itemNames].sort((a, b) => a.localeCompare(b));
    expect(itemNames).toEqual(sortedItemNames);
    return;
  }

  throw new Error(`Unsupported expected order: ${expectedOrder}`);
});
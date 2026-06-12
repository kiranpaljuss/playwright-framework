import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import SauceDemoPage from '../pages/sauceDemoPage';
import PageUrls from '../support/urls';

const { Given, When, Then, Before } = createBdd();
let sauceDemoPage!: SauceDemoPage;

const getSaucePassword = (): string => process.env.SAUCE_PASSWORD || 'secret_sauce';

Before(async ({ page }) => {
  sauceDemoPage = new SauceDemoPage(page);
});

const addProductToCart = async (productName: string): Promise<void> => {
  const productCard = sauceDemoPage.productCardByName(productName);

  await expect(productCard, `Product not found in inventory: ${productName}`).toHaveCount(1);
  await sauceDemoPage.addToCartButtonIn(productCard, productName).click();
};

Given(/^I open the SauceDemo login page$/, async ({ page }) => {
  await page.goto(PageUrls.sauceDemoPage());
  await expect(sauceDemoPage.usernameInput).toBeVisible();
});

When(/^I login to SauceDemo with user key "(.*)"$/, async ({}, userKey: string) => {
  const username = process.env[userKey];
  const password = getSaucePassword();

  if (!username) {
    throw new Error(`Missing environment variable for user key: ${userKey}`);
  }

  await sauceDemoPage.usernameInput.fill(username);
  await sauceDemoPage.passwordInput.fill(password);
  await sauceDemoPage.loginButton.click();
});

Then(/^I should be on the SauceDemo inventory page$/, async ({ page }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(sauceDemoPage.inventoryList).toBeVisible();
});

When(/^I add the following products to the cart:$/, async ({}, dataTable) => {
  const products = dataTable.hashes().map((row: { productName: string }) => row.productName);

  for (const productName of products) {
    await addProductToCart(productName);
  }
});

Given(/^I add "(.*)" to the cart$/, async ({}, productName: string) => {
  await addProductToCart(productName);
});

Then(/^the cart badge should show "(.*)"$/, async ({}, count: string) => {
  await expect(sauceDemoPage.shoppingCartBadge).toHaveText(count);
});

Then(/^I open the shopping cart$/, async ({ page }) => {
  await sauceDemoPage.shoppingCartLink.click();
  await expect(page).toHaveURL(/\/cart\.html$/);
});

Then(/^the cart should contain the following products:$/, async ({}, dataTable) => {
  const expectedProducts = dataTable.hashes().map((row: { productName: string }) => row.productName);
  const cartProductNames = await sauceDemoPage.cartItemNames.allTextContents();

  for (const expectedProduct of expectedProducts) {
    expect(cartProductNames).toContain(expectedProduct);
  }
});

When(/^I click continue shopping$/, async ({}) => {
  await sauceDemoPage.continueShoppingButton.click();
});

When(/^I select the "(.*)" sort option$/, async ({}, sortOption: string) => {
  await sauceDemoPage.productSortDropdown.selectOption({ label: sortOption });
});

Then(/^the inventory items should be in "(.*)" order$/, async ({}, expectedOrder: string) => {
  if (expectedOrder === 'ascending' || expectedOrder === 'descending') {
    const pricesRaw = await sauceDemoPage.inventoryItemPrices.allTextContents();
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
    const itemNames = await sauceDemoPage.inventoryItemNames.allTextContents();
    const sortedItemNames = [...itemNames].sort((a, b) => a.localeCompare(b));
    expect(itemNames).toEqual(sortedItemNames);
    return;
  }

  throw new Error(`Unsupported expected order: ${expectedOrder}`);
});
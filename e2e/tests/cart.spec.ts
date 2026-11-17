import { test, expect } from '../fixtures';

test.describe('Shopping cart', { tag: '@cart' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('add multiple products to the cart', { tag: '@smoke' }, async ({ page, inventoryPage, cartPage }) => {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

    for (const product of products) {
      await inventoryPage.addToCart(product);
    }
    await expect(inventoryPage.header.cartBadge).toHaveText(String(products.length));

    await inventoryPage.header.openCart();

    await expect(page).toHaveURL(/\/cart\.html$/);
    // An array assertion checks the exact items and order, and retries until the cart has rendered.
    await expect(cartPage.itemNames).toHaveText(products);
  });

  test('remove a product from the cart', { tag: '@regression' }, async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Onesie');
    await inventoryPage.header.openCart();

    await cartPage.removeItem('Sauce Labs Backpack');

    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Onesie']);
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test('removing a product from the inventory page clears the badge', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart('Sauce Labs Fleece Jacket');

    await expect(inventoryPage.header.cartBadge).toBeHidden();
  });

  test('continue shopping keeps the cart contents', { tag: '@regression' }, async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
    await inventoryPage.header.openCart();

    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });
});

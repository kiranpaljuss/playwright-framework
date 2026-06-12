import { Locator, Page } from '@playwright/test';

class SauceDemoPage {
  private readonly page: Page;

  constructor (page: Page) {
    this.page = page;
  }

  get usernameInput (): Locator {
    return this.page.getByTestId('username');
  }

  get passwordInput (): Locator {
    return this.page.getByTestId('password');
  }

  get loginButton (): Locator {
    return this.page.getByTestId('login-button');
  }

  get inventoryList (): Locator {
    return this.page.getByTestId('inventory-list');
  }

  get inventoryItems (): Locator {
    return this.page.getByTestId('inventory-item');
  }

  get inventoryItemNames (): Locator {
    return this.page.getByTestId('inventory-item-name');
  }

  get shoppingCartBadge (): Locator {
    return this.page.getByTestId('shopping-cart-badge');
  }

  get shoppingCartLink (): Locator {
    return this.page.getByTestId('shopping-cart-link');
  }

  get cartList (): Locator {
    return this.page.getByTestId('cart-list');
  }

  get cartItemNames (): Locator {
    return this.cartList.getByTestId('inventory-item-name');
  }

  get continueShoppingButton (): Locator {
    return this.page.getByTestId('continue-shopping');
  }

  get checkoutButton (): Locator {
    return this.page.getByTestId('checkout');
  }

  get productSortDropdown (): Locator {
    return this.page.getByTestId('product-sort-container');
  }

  get inventoryItemPrices (): Locator {
    return this.page.getByTestId('inventory-item-price');
  }

  productCardByName (productName: string): Locator {
    return this.inventoryItems.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: productName })
    });
  }

  addToCartButtonIn (productCard: Locator, productName: string): Locator {
    const productSlug = productName.trim().toLowerCase().replace(/\s+/g, '-');
    return productCard.getByTestId(`add-to-cart-${productSlug}`);
  }
}

export default SauceDemoPage;
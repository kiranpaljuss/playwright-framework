class SauceDemoPage {
  get usernameInput (): string {
    return '#user-name';
  }

  get passwordInput (): string {
    return '#password';
  }

  get loginButton (): string {
    return '#login-button';
  }

  get inventoryList (): string {
    return '.inventory_list';
  }

  get inventoryItem (): string {
    return '.inventory_item';
  }

  get inventoryItemName (): string {
    return '.inventory_item_name';
  }

  get addToCartButton (): string {
    return 'button:has-text("Add to cart")';
  }

  get shoppingCartBadge (): string {
    return '.shopping_cart_badge';
  }

  get shoppingCartLink (): string {
    return '.shopping_cart_link';
  }

  get cartItemName (): string {
    return '.cart_item .inventory_item_name';
  }

  get continueShoppingButton (): string {
    return '#continue-shopping';
  }

  get productSortDropdown (): string {
    return '.product_sort_container';
  }

  get inventoryItemPrice (): string {
    return '.inventory_item_price';
  }
}

export default new SauceDemoPage();
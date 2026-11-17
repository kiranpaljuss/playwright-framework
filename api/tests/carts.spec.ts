import { test, expect } from '../fixtures';
import { Cart, CartSchema } from '../schemas';

/** Checks that every total in a cart is consistent with its line items. */
const expectTotalsToAddUp = (cart: Cart): void => {
  for (const item of cart.products) {
    expect(item.total, `line total for product ${item.id}`).toBeCloseTo(item.price * item.quantity, 2);
  }
  expect(cart.totalProducts).toBe(cart.products.length);
  expect(cart.totalQuantity).toBe(cart.products.reduce((sum, item) => sum + item.quantity, 0));
  expect(cart.total).toBeCloseTo(cart.products.reduce((sum, item) => sum + item.total, 0), 2);
  expect(cart.discountedTotal).toBeLessThanOrEqual(cart.total);
};

test.describe('Carts API', { tag: ['@api', '@carts'] }, () => {
  test('get a cart with consistent totals', { tag: '@smoke' }, async ({ cartsApi }) => {
    const response = await cartsApi.get(1);

    expect(response.status()).toBe(200);
    expectTotalsToAddUp(CartSchema.parse(await response.json()));
  });

  test('create a cart and calculate its totals', { tag: '@regression' }, async ({ cartsApi }) => {
    const items = [{ id: 1, quantity: 2 }, { id: 5, quantity: 1 }];

    const response = await cartsApi.add(1, items);

    expect(response.status()).toBe(201);
    const cart = CartSchema.parse(await response.json());
    expect(cart.userId).toBe(1);
    expect(cart.products.map(({ id, quantity }) => ({ id, quantity }))).toEqual(items);
    expectTotalsToAddUp(cart);
  });

  test('merging a product into an existing cart adds it', { tag: '@regression' }, async ({ cartsApi }) => {
    const original = CartSchema.parse(await (await cartsApi.get(1)).json());
    const newItem = { id: 1, quantity: 1 };

    const response = await cartsApi.update(1, [newItem]);

    expect(response.status()).toBe(200);
    const updated = CartSchema.parse(await response.json());
    expect(updated.totalProducts).toBe(original.totalProducts + 1);
    expect(updated.products).toContainEqual(expect.objectContaining(newItem));
    expectTotalsToAddUp(updated);
  });

  test('delete a cart', { tag: '@regression' }, async ({ cartsApi }) => {
    const response = await cartsApi.delete(1);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, isDeleted: true });
  });
});

import { test, expect } from '../fixtures';
import { ErrorSchema, ProductListSchema, ProductSchema, UpdatedProductSchema } from '../schemas';

test.describe('Products API', { tag: ['@api', '@products'] }, () => {
  test('get a single product', { tag: '@smoke' }, async ({ productsApi }) => {
    const response = await productsApi.get(1);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(ProductSchema.parse(await response.json()).id).toBe(1);
  });

  test('an unknown product returns 404', { tag: '@regression' }, async ({ productsApi }) => {
    const response = await productsApi.get(999999);

    expect(response.status()).toBe(404);
    expect(ErrorSchema.parse(await response.json()).message).toBe("Product with id '999999' not found");
  });

  test('pagination returns the requested page', { tag: '@regression' }, async ({ productsApi }) => {
    const firstPage = ProductListSchema.parse(await (await productsApi.list({ limit: 10, skip: 0 })).json());
    const secondPage = ProductListSchema.parse(await (await productsApi.list({ limit: 5, skip: 5 })).json());

    expect(secondPage).toMatchObject({ limit: 5, skip: 5, total: firstPage.total });
    // The second page should be the second half of the first ten products.
    expect(secondPage.products.map(p => p.id)).toEqual(firstPage.products.slice(5).map(p => p.id));
  });

  test('select limits the returned fields', { tag: '@regression' }, async ({ productsApi }) => {
    const response = await productsApi.list({ limit: 3, select: ['title', 'price'] });

    expect(response.status()).toBe(200);
    const { products } = await response.json();
    for (const product of products) {
      expect(Object.keys(product).sort()).toEqual(['id', 'price', 'title']);
    }
  });

  test('search only returns matching products', { tag: '@regression' }, async ({ productsApi }) => {
    const response = await productsApi.search('phone');

    expect(response.status()).toBe(200);
    const { products, total } = ProductListSchema.parse(await response.json());
    expect(total).toBeGreaterThan(0);
    for (const { title, description } of products) {
      expect(`${title} ${description}`.toLowerCase()).toContain('phone');
    }
  });

  test('category filter only returns products in that category', { tag: '@regression' }, async ({ productsApi }) => {
    const response = await productsApi.byCategory('smartphones');

    const { products, total } = ProductListSchema.parse(await response.json());
    expect(products).toHaveLength(total);
    expect(new Set(products.map(p => p.category))).toEqual(new Set(['smartphones']));
  });

  // DummyJSON simulates writes: responses reflect the change, but nothing is stored on the server.
  test.describe('write operations', { tag: '@regression' }, () => {
    test('add a product', async ({ productsApi }) => {
      const newProduct = { title: 'Automation Test Mug', price: 12.5, category: 'kitchen-accessories' };

      const response = await productsApi.add(newProduct);

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject(newProduct);
      expect(body.id).toEqual(expect.any(Number));
    });

    test('update a product', async ({ productsApi }) => {
      const response = await productsApi.update(1, { title: 'Renamed Product', price: 1.99 });

      expect(response.status()).toBe(200);
      expect(UpdatedProductSchema.parse(await response.json())).toMatchObject({ id: 1, title: 'Renamed Product', price: 1.99 });
    });

    test('delete a product', async ({ productsApi }) => {
      const response = await productsApi.delete(1);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({ id: 1, isDeleted: true });
      expect(Date.parse(body.deletedOn)).not.toBeNaN();
    });
  });
});

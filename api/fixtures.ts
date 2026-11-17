import { test as base, expect } from '@playwright/test';
import { AuthClient, CartsClient, ProductsClient } from './clients';
import { LoginResponseSchema } from './schemas';

interface ApiFixtures {
  authApi: AuthClient;
  productsApi: ProductsClient;
  cartsApi: CartsClient;
}

interface WorkerFixtures {
  apiUser: { username: string; password: string };
  accessToken: string;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable "${key}". Copy .env.template to .env or set it in CI.`);
  }
  return value;
};

export const test = base.extend<ApiFixtures, WorkerFixtures>({
  // Playwright requires the first fixture argument to be a destructuring pattern, even when empty.
  // eslint-disable-next-line no-empty-pattern
  apiUser: [async ({}, use) => {
    await use({ username: requireEnv('DUMMYJSON_USERNAME'), password: requireEnv('DUMMYJSON_PASSWORD') });
  }, { scope: 'worker' }],

  // Logs in once per worker and shares the token, rather than logging in for every test.
  accessToken: [async ({ playwright, apiUser }, use, workerInfo) => {
    const request = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
    const response = await new AuthClient(request).login({ ...apiUser, expiresInMins: 30 });
    expect(response.status(), 'login for shared access token').toBe(200);
    const { accessToken } = LoginResponseSchema.parse(await response.json());
    await use(accessToken);
    await request.dispose();
  }, { scope: 'worker' }],

  authApi: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  productsApi: async ({ request }, use) => {
    await use(new ProductsClient(request));
  },
  cartsApi: async ({ request }, use) => {
    await use(new CartsClient(request));
  }
});

export { expect };

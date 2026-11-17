import { test, expect } from '../fixtures';
import { getCredentials } from '../users';

// Login tests must start signed out, so opt out of the shared authenticated session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', { tag: '@login' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', { tag: '@smoke' }, async ({ page, loginPage, inventoryPage }) => {
    const { username, password } = getCredentials('standard');

    await loginPage.login(username, password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  test('locked out user cannot log in', { tag: '@regression' }, async ({ page, loginPage }) => {
    const { username, password } = getCredentials('locked out');

    await loginPage.login(username, password);

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/\/inventory\.html$/);
  });

  const invalidLogins = [
    { reason: 'a wrong password', username: 'standard_user', password: 'wrong_password', error: 'Epic sadface: Username and password do not match any user in this service' },
    { reason: 'no username', username: '', password: 'secret_sauce', error: 'Epic sadface: Username is required' },
    { reason: 'no password', username: 'standard_user', password: '', error: 'Epic sadface: Password is required' }
  ];

  for (const { reason, username, password, error } of invalidLogins) {
    test(`login is rejected with ${reason}`, { tag: '@regression' }, async ({ page, loginPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(page).not.toHaveURL(/\/inventory\.html$/);
    });
  }

  test('user can log out', { tag: '@regression' }, async ({ page, loginPage, inventoryPage }) => {
    const { username, password } = getCredentials('standard');
    await loginPage.login(username, password);

    await inventoryPage.header.logout();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});

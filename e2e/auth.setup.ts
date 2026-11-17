import { test as setup, expect } from './fixtures';
import { getCredentials, STANDARD_USER_STATE } from './users';

/**
 * Logs in once through the UI and saves the session (cookies + local storage).
 * Browser projects depend on this setup and start every test already
 * authenticated, so only the login tests themselves go through the login form.
 */
setup('authenticate as standard user', async ({ page, loginPage, inventoryPage }) => {
  const { username, password } = getCredentials('standard');

  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(inventoryPage.inventoryList).toBeVisible();

  await page.context().storageState({ path: STANDARD_USER_STATE });
});

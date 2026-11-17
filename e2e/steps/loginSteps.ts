import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { getCredentials } from '../support/users';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
  await expect(loginPage.usernameInput).toBeVisible();
});

Given('I am logged in as the {string} user', async ({ loginPage, inventoryPage, page }, persona: string) => {
  const { username, password } = getCredentials(persona);
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryPage.inventoryList).toBeVisible();
});

When('I log in as the {string} user', async ({ loginPage }, persona: string) => {
  const { username, password } = getCredentials(persona);
  await loginPage.login(username, password);
});

When('I log in with username {string} and password {string}', async ({ loginPage }, username: string, password: string) => {
  await loginPage.login(username, password);
});

When('I log out', async ({ inventoryPage }) => {
  await inventoryPage.header.logout();
});

Then('I should see the inventory page', async ({ page, inventoryPage }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryPage.inventoryList).toBeVisible();
});

Then('I should be on the login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(/\/$/);
  await expect(loginPage.loginButton).toBeVisible();
});

Then('I should see the login error {string}', async ({ page, loginPage }, message: string) => {
  await expect(loginPage.errorMessage).toHaveText(message);
  await expect(page).not.toHaveURL(/\/inventory\.html$/);
});

import { test, expect } from '../fixtures';
import { ErrorSchema, LoginResponseSchema, UserSchema } from '../schemas';

test.describe('Auth API', { tag: ['@api', '@auth'] }, () => {
  test('login returns tokens and the user profile', { tag: '@smoke' }, async ({ authApi, apiUser }) => {
    const response = await authApi.login(apiUser);

    expect(response.status()).toBe(200);
    const body = LoginResponseSchema.parse(await response.json());
    expect(body.username).toBe(apiUser.username);
  });

  test('an access token identifies the logged-in user', async ({ authApi, apiUser, accessToken }) => {
    const response = await authApi.currentUser(accessToken);

    expect(response.status()).toBe(200);
    expect(UserSchema.parse(await response.json()).username).toBe(apiUser.username);
  });

  test('login is rejected with a wrong password', { tag: '@regression' }, async ({ authApi, apiUser }) => {
    const response = await authApi.login({ username: apiUser.username, password: 'wrong-password' });

    expect(response.status()).toBe(400);
    expect(ErrorSchema.parse(await response.json()).message).toBe('Invalid credentials');
  });

  const unauthorised = [
    { reason: 'no token', token: undefined, message: 'Access Token is required' },
    { reason: 'an invalid token', token: 'not-a-real-token', message: 'Invalid/Expired Token!' }
  ];

  for (const { reason, token, message } of unauthorised) {
    test(`profile request is rejected with ${reason}`, { tag: '@regression' }, async ({ authApi }) => {
      const response = await authApi.currentUser(token);

      expect(response.status()).toBe(401);
      expect(ErrorSchema.parse(await response.json()).message).toBe(message);
    });
  }
});

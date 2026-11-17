/**
 * Maps the user personas referenced in feature files to environment variables.
 * Credentials are loaded from .env (falling back to .env.template) in playwright.config.ts.
 */
const USER_ENV_KEYS = {
  standard: 'SAUCE_STANDARD_USER',
  'locked out': 'SAUCE_LOCKED_OUT_USER',
  problem: 'SAUCE_PROBLEM_USER',
  'performance glitch': 'SAUCE_PERFORMANCE_GLITCH_USER',
  error: 'SAUCE_ERROR_USER',
  visual: 'SAUCE_VISUAL_USER'
} as const;

export type UserPersona = keyof typeof USER_ENV_KEYS;

export interface Credentials {
  username: string;
  password: string;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable "${key}". Copy .env.template to .env or set it in CI.`);
  }
  return value;
};

export const getCredentials = (persona: string): Credentials => {
  if (!(persona in USER_ENV_KEYS)) {
    throw new Error(`Unknown user persona "${persona}". Expected one of: ${Object.keys(USER_ENV_KEYS).join(', ')}`);
  }

  return {
    username: requireEnv(USER_ENV_KEYS[persona as UserPersona]),
    password: requireEnv('SAUCE_PASSWORD')
  };
};

const {
  FRONTEND_URL,
  BACKEND_URL,
  SSO_ENVIRONMENT = 'dev',
  SSO_REALM = 'standard',
  SSO_PROTOCOL = 'openid-connect',
  COOKIE_DOMAIN = FRONTEND_URL?.includes('localhost') ? 'localhost' : '.gov.bc.ca',
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} = process.env;

// Exports.
const config = {
  SSO_CLIENT_ID: SSO_CLIENT_ID?.trim(),
  SSO_CLIENT_SECRET: SSO_CLIENT_SECRET?.trim(),
  COOKIE_DOMAIN: COOKIE_DOMAIN.trim(),
  SSO_ENVIRONMENT: SSO_ENVIRONMENT.trim(),
  SSO_REALM: SSO_REALM.trim(),
  SSO_PROTOCOL: SSO_PROTOCOL.trim(),
  LOGIN_ROUTE: '/auth/login',
  LOGIN_CALLBACK_ROUTE: '/auth/login/callback',
  LOGOUT_ROUTE: '/auth/logout',
  LOGOUT_CALLBACK_ROUTE: '/auth/logout/callback',
  TOKEN_ROUTE: '/auth/token',
  FRONTEND_URL: FRONTEND_URL?.trim(),
  BACKEND_URL: BACKEND_URL?.trim(),
};

// Throw error if env vars are not set.
if (!FRONTEND_URL || !BACKEND_URL || !SSO_CLIENT_ID || !SSO_CLIENT_SECRET)
  throw new Error(
    `One or more environment variables were undefined for package 'citz-imb-sso-js-server'. 
    Ensure [FRONTEND_URL, BACKEND_URL, SSO_CLIENT_ID, SSO_CLIENT_SECRET] variables are set.`,
  );

export default config;

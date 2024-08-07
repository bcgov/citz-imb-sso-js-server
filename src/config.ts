const {
  FRONTEND_URL,
  BACKEND_URL,
  SSO_ENVIRONMENT = 'dev',
  SSO_REALM = 'standard',
  SSO_PROTOCOL = 'oidc',
  COOKIE_DOMAIN = FRONTEND_URL?.includes('localhost') ? 'localhost' : '.gov.bc.ca',
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} = process.env;

// Exports.
const config = {
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  COOKIE_DOMAIN,
  SSO_ENVIRONMENT,
  SSO_REALM,
  SSO_PROTOCOL,
  LOGIN_ROUTE: '/auth/login',
  LOGIN_CALLBACK_ROUTE: '/auth/login/callback',
  LOGOUT_ROUTE: '/auth/logout',
  LOGOUT_CALLBACK_ROUTE: '/auth/logout/callback',
  TOKEN_ROUTE: '/auth/token',
  FRONTEND_URL,
  BACKEND_URL,
};

// Throw error if env vars are not set.
if (!FRONTEND_URL || !BACKEND_URL || !SSO_CLIENT_ID || !SSO_CLIENT_SECRET)
  throw new Error(
    `One or more environment variables were undefined for package 'citz-imb-sso-js-server'. 
    Ensure [FRONTEND_URL, BACKEND_URL, SSO_CLIENT_ID, SSO_CLIENT_SECRET] variables are set.`,
  );

export default config;

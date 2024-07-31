/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { SSOOptions } from '../types';
import { parseCookies, setCookie } from '../utils';
import type { OriginalSSOUser, SSOEnvironment, SSOProtocol } from '@bcgov/citz-imb-sso-js-core';
import { decodeJWT, getTokens, normalizeUser } from '@bcgov/citz-imb-sso-js-core';

import config from '../config';
const {
  FRONTEND_URL,
  BACKEND_URL,
  LOGIN_CALLBACK_ROUTE,
  COOKIE_DOMAIN,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  SSO_ENVIRONMENT,
  SSO_REALM,
  SSO_PROTOCOL,
} = config;

/**
 * Redirects user to the frontend, with refresh token.
 * @method GET
 * @route /auth/login/callback
 */
export const loginCallback = async (
  req: IncomingMessage,
  res: ServerResponse,
  options?: SSOOptions,
) => {
  try {
    const urlParts = parse(req.url as string, true);
    const { code } = urlParts.query;

    const { post_login_redirect_url } = parseCookies(req.headers.cookie);

    const { access_token, refresh_token, refresh_expires_in } = await getTokens({
      code: code as string,
      clientID: SSO_CLIENT_ID!,
      clientSecret: SSO_CLIENT_SECRET!,
      redirectURI: `${BACKEND_URL}${LOGIN_CALLBACK_ROUTE}`,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    });

    const redirectURL = `${FRONTEND_URL}?refresh_expires_in=${refresh_expires_in}&post_login_redirect_url=${post_login_redirect_url}`;

    // Set cookie
    setCookie(res, 'refresh_token', refresh_token as string, {
      domain: COOKIE_DOMAIN,
    });

    res.writeHead(302, { Location: redirectURL });

    // Run after login callback request.
    if (options?.afterUserLogin) {
      const user = decodeJWT(access_token) as OriginalSSOUser<unknown>;
      const normalizedUser = normalizeUser<unknown>(user);

      if (normalizedUser) options.afterUserLogin(normalizedUser);
    }
    return res.end();
  } catch (error: unknown) {
    res.setHeader('Content-Type', 'application/json');
    if (error instanceof Error) {
      res.end(JSON.stringify({ success: false, error: error.message }));
    } else {
      res.end(JSON.stringify({ success: false, error: error }));
    }
  }
};

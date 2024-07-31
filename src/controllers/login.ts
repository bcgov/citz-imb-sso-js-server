/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { SSOOptions } from '../types';
import { setCookie } from '../utils';
import type { SSOEnvironment, SSOIdentityProvider, SSOProtocol } from '@bcgov/citz-imb-sso-js-core';
import { getLoginURL } from '@bcgov/citz-imb-sso-js-core';

import config from '../config';
const {
  BACKEND_URL,
  COOKIE_DOMAIN,
  LOGIN_CALLBACK_ROUTE,
  SSO_CLIENT_ID,
  SSO_ENVIRONMENT,
  SSO_REALM,
  SSO_PROTOCOL,
} = config;

/**
 * Prompts the user to login.
 * @method GET
 * @route /auth/login
 */
export const login = async (req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  try {
    const urlParts = parse(req.url as string, true);
    const { idp, post_login_redirect_url } = urlParts.query;

    const redirectURL = getLoginURL({
      idpHint: idp as SSOIdentityProvider,
      clientID: SSO_CLIENT_ID!,
      redirectURI: `${BACKEND_URL}${LOGIN_CALLBACK_ROUTE}`,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    });

    if (!req.token) {
      // Set cookie
      setCookie(res, 'post_login_redirect_url', post_login_redirect_url as string, {
        domain: COOKIE_DOMAIN,
      });

      res.writeHead(302, { Location: redirectURL });
      return res.end();
    }

    res.writeHead(302, { Location: '' });
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

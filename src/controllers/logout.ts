/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { SSOOptions } from '../types';
import type {
  OriginalSSOUser,
  SSOEnvironment,
  SSOIdentityProvider,
  SSOProtocol,
} from '@bcgov/citz-imb-sso-js-core';
import { decodeJWT, getLogoutURL, normalizeUser } from '@bcgov/citz-imb-sso-js-core';

import config from '../config';
const { BACKEND_URL, LOGOUT_CALLBACK_ROUTE, SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL } = config;

/**
 * Logs out the user and, once finished, redirects them to /auth/logout/callback
 * @method GET
 * @route /auth/logout
 */
export const logout = async (req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  try {
    const urlParts = parse(req.url as string, true);
    const { id_token } = urlParts.query;

    if (!id_token) {
      res.writeHead(401, 'id_token query param required');
      return res.end();
    }

    const redirectURL = getLogoutURL({
      idToken: id_token as SSOIdentityProvider,
      postLogoutRedirectURI: `${BACKEND_URL}${LOGOUT_CALLBACK_ROUTE}`,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    });

    res.writeHead(302, { Location: redirectURL });

    if (options?.afterUserLogout) {
      const user = decodeJWT(id_token as string) as OriginalSSOUser<unknown>;
      const normalizedUser = normalizeUser<unknown>(user);

      if (normalizedUser) options.afterUserLogout(normalizedUser);
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

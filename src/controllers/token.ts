/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncomingMessage, ServerResponse } from 'http';
import { SSOOptions } from '../types';
import type { SSOEnvironment, SSOProtocol } from '@bcgov/citz-imb-sso-js-core';
import { getNewTokens } from '@bcgov/citz-imb-sso-js-core';
import { parseCookies } from '../utils';

import config from '../config';
const { SSO_ENVIRONMENT, SSO_REALM, SSO_PROTOCOL, SSO_CLIENT_ID, SSO_CLIENT_SECRET } = config;

/**
 * Use refresh token to get a new access token.
 * @method POST
 * @route /auth/token
 */
export const token = async (req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  try {
    const { refresh_token } = parseCookies(req.headers.cookie);

    if (!refresh_token || refresh_token === '') {
      res.writeHead(401, 'Cookies must include refresh_token.');
      return res.end();
    }

    const tokens = await getNewTokens({
      refreshToken: refresh_token,
      clientID: SSO_CLIENT_ID!,
      clientSecret: SSO_CLIENT_SECRET!,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    });

    res.writeHead(200);
    return res.end(JSON.stringify(tokens));
  } catch (error: unknown) {
    res.setHeader('Content-Type', 'application/json');
    if (error instanceof Error) {
      res.end(JSON.stringify({ success: false, error: error.message }));
    } else {
      res.end(JSON.stringify({ success: false, error: error }));
    }
  }
};

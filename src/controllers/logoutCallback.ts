/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncomingMessage, ServerResponse } from 'http';
import { SSOOptions } from '../types';

import config from '../config';
import { setCookie } from '@/utils';
const { FRONTEND_URL, COOKIE_DOMAIN } = config;

/**
 * Removes the user's refresh token, and redirects back to the frontend.
 * @method GET
 * @route /auth/logout/callback
 */
export const logoutCallback = async (
  req: IncomingMessage,
  res: ServerResponse,
  options?: SSOOptions,
) => {
  try {
    // Set cookie
    setCookie(res, 'refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: COOKIE_DOMAIN,
    });

    res.writeHead(302, { Location: FRONTEND_URL });
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

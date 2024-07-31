import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { SSOOptions } from '@/types';
import { parseCookies, setCookie } from '@/utils';
import { decodeJWT, getTokens, normalizeUser } from '@bcgov/citz-imb-sso-js-core';
import config from '@/config';
import { loginCallback } from '@/controllers';

jest.mock('url', () => ({
  parse: jest.fn(),
}));

jest.mock('@/utils', () => ({
  parseCookies: jest.fn(),
  setCookie: jest.fn(),
}));

jest.mock('@bcgov/citz-imb-sso-js-core', () => ({
  decodeJWT: jest.fn(),
  getTokens: jest.fn(),
  normalizeUser: jest.fn(),
}));

jest.mock('@/config', () => ({
  FRONTEND_URL: 'http://frontend.url',
  BACKEND_URL: 'http://backend.url',
  LOGIN_CALLBACK_ROUTE: '/auth/login/callback',
  COOKIE_DOMAIN: 'localhost',
  SSO_CLIENT_ID: 'client_id',
  SSO_CLIENT_SECRET: 'client_secret',
}));

// Test suite for loginCallback function
describe('loginCallback function', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const options: SSOOptions = {};

  beforeEach(() => {
    req = {
      url: '/auth/login/callback?code=test_code',
      headers: {
        cookie: 'post_login_redirect_url=http://redirect.url',
      },
    } as IncomingMessage;

    res = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;

    (parse as jest.Mock).mockReturnValue({
      query: {
        code: 'test_code',
      },
    });

    (parseCookies as jest.Mock).mockReturnValue({
      post_login_redirect_url: 'http://redirect.url',
    });

    (getTokens as jest.Mock).mockResolvedValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      refresh_expires_in: 3600,
    });

    (decodeJWT as jest.Mock).mockReturnValue({});
    (normalizeUser as jest.Mock).mockReturnValue({});
  });

  // Test case: should redirect the user to the frontend with refresh token
  it('should redirect the user to the frontend with refresh token', async () => {
    await loginCallback(req, res, options);

    expect(getTokens).toHaveBeenCalledWith({
      code: 'test_code',
      clientID: config.SSO_CLIENT_ID,
      clientSecret: config.SSO_CLIENT_SECRET,
      redirectURI: `${config.BACKEND_URL}${config.LOGIN_CALLBACK_ROUTE}`,
      ssoEnvironment: config.SSO_ENVIRONMENT,
      ssoRealm: config.SSO_REALM,
      ssoProtocol: config.SSO_PROTOCOL,
    });

    const redirectURL = `${config.FRONTEND_URL}?refresh_expires_in=3600&post_login_redirect_url=http://redirect.url`;

    expect(setCookie).toHaveBeenCalledWith(res, 'refresh_token', 'refresh_token', {
      domain: config.COOKIE_DOMAIN,
    });

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: redirectURL });
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should call afterUserLogin callback if provided
  it('should call afterUserLogin callback if provided', async () => {
    const afterUserLogin = jest.fn();
    const optionsWithCallback = { afterUserLogin };

    await loginCallback(req, res, optionsWithCallback);

    expect(decodeJWT).toHaveBeenCalledWith('access_token');
    expect(normalizeUser).toHaveBeenCalledWith({});
    expect(afterUserLogin).toHaveBeenCalledWith({});
  });

  // Test case: should handle errors and respond with JSON
  it('should handle errors and respond with JSON', async () => {
    const error = new Error('Something went wrong');
    (getTokens as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await loginCallback(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error: error.message }));
  });

  // Test case: should handle unexpected errors and respond with JSON
  it('should handle unexpected errors and respond with JSON', async () => {
    const error = 'Unexpected error';
    (getTokens as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await loginCallback(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error }));
  });
});

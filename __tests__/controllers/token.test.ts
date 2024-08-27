import { IncomingMessage, ServerResponse } from 'http';
import { SSOOptions } from '@/types';
import { getNewTokens } from '@bcgov/citz-imb-sso-js-core';
import { parseCookies } from '@/utils';
import config from '@/config';
import { token } from '@/controllers';

jest.mock('@/utils', () => ({
  parseCookies: jest.fn(),
}));

jest.mock('@bcgov/citz-imb-sso-js-core', () => ({
  getNewTokens: jest.fn(),
}));

jest.mock('@/config', () => ({
  SSO_CLIENT_ID: 'client_id',
  SSO_CLIENT_SECRET: 'client_secret',
}));

// Test suite for token function
describe('token function', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const options: SSOOptions = {};

  beforeEach(() => {
    req = {
      headers: {
        cookie: 'refresh_token=test_refresh_token',
      },
    } as IncomingMessage;

    res = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;

    (parseCookies as jest.Mock).mockReturnValue({
      refresh_token: 'test_refresh_token',
    });

    (getNewTokens as jest.Mock).mockResolvedValue({
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      expires_in: 3600,
    });
  });

  // Test case: should get new tokens and respond with JSON
  it('should get new tokens and respond with JSON', async () => {
    await token(req, res, options);

    expect(getNewTokens).toHaveBeenCalledWith({
      refreshToken: 'test_refresh_token',
      clientID: config.SSO_CLIENT_ID,
      clientSecret: config.SSO_CLIENT_SECRET,
      ssoEnvironment: config.SSO_ENVIRONMENT,
      ssoRealm: config.SSO_REALM,
      ssoProtocol: config.SSO_PROTOCOL,
    });

    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 3600,
      }),
    );
  });

  // Test case: should return 401 if refresh_token is not provided
  it('should return 401 if refresh_token is not provided', async () => {
    (parseCookies as jest.Mock).mockReturnValue({});

    await token(req, res, options);

    expect(res.writeHead).toHaveBeenCalledWith(401, 'Cookies must include refresh_token.');
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should handle errors and respond with JSON
  it('should handle errors and respond with JSON', async () => {
    const error = new Error('Something went wrong');
    (getNewTokens as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await token(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error: error.message }));
  });

  // Test case: should handle unexpected errors and respond with JSON
  it('should handle unexpected errors and respond with JSON', async () => {
    const error = 'Unexpected error';
    (getNewTokens as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await token(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error }));
  });
});

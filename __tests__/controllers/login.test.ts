import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { getLoginURL } from '@bcgov/citz-imb-sso-js-core';
import { login } from '@/controllers';
import { setCookie } from '@/utils';

jest.mock('url', () => ({
  parse: jest.fn(),
}));

jest.mock('@bcgov/citz-imb-sso-js-core', () => ({
  getLoginURL: jest.fn(),
}));

jest.mock('@/config', () => ({
  BACKEND_URL: 'http://localhost:5000',
  COOKIE_DOMAIN: 'localhost',
  LOGIN_CALLBACK_ROUTE: '/auth/login/callback',
  SSO_CLIENT_ID: 'client_id',
}));

jest.mock('@/utils', () => ({
  setCookie: jest.fn(),
}));

// Test suite for login function
describe('login function', () => {
  let req: IncomingMessage & { token?: string };
  let res: ServerResponse;

  beforeEach(() => {
    req = {
      url: '/auth/login?idp=someIdp&post_login_redirect_url=http://redirect.url',
      headers: {
        cookie: '',
      },
    } as IncomingMessage & { token?: string };

    res = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;

    (parse as jest.Mock).mockReturnValue({
      query: {
        idp: 'someIdp',
        post_login_redirect_url: 'http://redirect.url',
      },
    });

    (getLoginURL as jest.Mock).mockReturnValue('http://login.url');
  });

  // Test case: should prompt the user to login when token is not present
  it('should prompt the user to login when token is not present', async () => {
    await login(req, res);

    expect(getLoginURL).toHaveBeenCalledWith({
      idpHint: 'someIdp',
      clientID: 'client_id',
      redirectURI: 'http://localhost:5000/auth/login/callback',
    });

    expect(setCookie).toHaveBeenCalledWith(res, 'post_login_redirect_url', 'http://redirect.url', {
      domain: 'localhost',
    });

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: 'http://login.url' });
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should redirect when token is present
  it('should redirect when token is present', async () => {
    req.token = 'someToken';

    await login(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '' });
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should handle errors and respond with JSON
  it('should handle errors and respond with JSON', async () => {
    const error = new Error('Something went wrong');
    (getLoginURL as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await login(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error: error.message }));
  });

  // Test case: should handle unexpected errors and respond with JSON
  it('should handle unexpected errors and respond with JSON', async () => {
    const error = 'Unexpected error';
    (getLoginURL as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await login(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error }));
  });
});

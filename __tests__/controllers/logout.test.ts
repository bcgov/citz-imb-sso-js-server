import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { decodeJWT, getLogoutURL, normalizeUser } from '@bcgov/citz-imb-sso-js-core';
import { logout } from '@/controllers';
import { SSOOptions } from '@/types';

jest.mock('url', () => ({
  parse: jest.fn(),
}));

jest.mock('@bcgov/citz-imb-sso-js-core', () => ({
  decodeJWT: jest.fn(),
  getLogoutURL: jest.fn(),
  normalizeUser: jest.fn(),
}));

jest.mock('@/config', () => ({
  BACKEND_URL: 'http://localhost:5000',
  LOGOUT_CALLBACK_ROUTE: '/auth/logout/callback',
}));

// Test suite for logout function
describe('logout function', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const options: SSOOptions = {};

  beforeEach(() => {
    req = {
      url: '/auth/logout?id_token=test_token',
    } as IncomingMessage;

    res = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;

    (parse as jest.Mock).mockReturnValue({
      query: {
        id_token: 'test_token',
      },
    });

    (getLogoutURL as jest.Mock).mockReturnValue('http://logout.url');
    (decodeJWT as jest.Mock).mockReturnValue({});
    (normalizeUser as jest.Mock).mockReturnValue({});
  });

  // Test case: should log out the user and redirect to the logout callback
  it('should log out the user and redirect to the logout callback', async () => {
    await logout(req, res, options);

    expect(getLogoutURL).toHaveBeenCalledWith({
      idToken: 'test_token',
      postLogoutRedirectURI: 'http://localhost:5000/auth/logout/callback',
    });

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: 'http://logout.url' });
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should call afterUserLogout callback if provided
  it('should call afterUserLogout callback if provided', async () => {
    const afterUserLogout = jest.fn();
    const optionsWithCallback = { afterUserLogout };

    await logout(req, res, optionsWithCallback);

    expect(decodeJWT).toHaveBeenCalledWith('test_token');
    expect(normalizeUser).toHaveBeenCalledWith({});
    expect(afterUserLogout).toHaveBeenCalledWith({});
  });

  // Test case: should return 401 if id_token is not provided
  it('should return 401 if id_token is not provided', async () => {
    (parse as jest.Mock).mockReturnValue({
      query: {},
    });

    await logout(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(401, 'id_token query param required');
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should handle errors and respond with JSON
  it('should handle errors and respond with JSON', async () => {
    const error = new Error('Something went wrong');
    (getLogoutURL as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await logout(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error: error.message }));
  });

  // Test case: should handle unexpected errors and respond with JSON
  it('should handle unexpected errors and respond with JSON', async () => {
    const error = 'Unexpected error';
    (getLogoutURL as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await logout(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error }));
  });
});

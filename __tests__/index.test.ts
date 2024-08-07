import { IncomingMessage, ServerResponse } from 'http';
import { SSO } from '@/index';
import { login, loginCallback, logout, logoutCallback, token } from '@/controllers';
import { protectedRoute } from '@/protectedRoute';
import { ProtectedRouteOptions, SSOOptions } from '@/types';

jest.mock('@/config', () => ({
  SSO_CLIENT_ID: 'client_id',
  SSO_CLIENT_SECRET: 'client_secret',
}));

jest.mock('@/controllers', () => {
  return {
    login: jest.fn(),
    loginCallback: jest.fn(),
    logout: jest.fn(),
    logoutCallback: jest.fn(),
    token: jest.fn(),
  };
});

jest.mock('@/protectedRoute', () => {
  return {
    protectedRoute: jest.fn(),
  };
});

const mockLogin = login as jest.Mock;
const mockLoginCallback = loginCallback as jest.Mock;
const mockLogout = logout as jest.Mock;
const mockLogoutCallback = logoutCallback as jest.Mock;
const mockToken = token as jest.Mock;
const mockProtectedRoute = protectedRoute as jest.Mock;

describe('SSO class', () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;
  let options: SSOOptions;
  let sso: SSO;

  beforeEach(() => {
    req = {};
    res = {
      end: jest.fn(),
      writeHead: jest.fn(),
    };
    options = {};
    sso = new SSO();
    jest.clearAllMocks();
  });

  it('should handle /auth/login route', () => {
    req.url = '/auth/login';
    sso.handleRequest(req as IncomingMessage, res as ServerResponse, options);

    expect(mockLogin).toHaveBeenCalledWith(req, res, options);
  });

  it('should handle /auth/login/callback route', () => {
    req.url = '/auth/login/callback';
    sso.handleRequest(req as IncomingMessage, res as ServerResponse, options);

    expect(mockLoginCallback).toHaveBeenCalledWith(req, res, options);
  });

  it('should handle /auth/logout route', () => {
    req.url = '/auth/logout';
    sso.handleRequest(req as IncomingMessage, res as ServerResponse, options);

    expect(mockLogout).toHaveBeenCalledWith(req, res, options);
  });

  it('should handle /auth/logout/callback route', () => {
    req.url = '/auth/logout/callback';
    sso.handleRequest(req as IncomingMessage, res as ServerResponse, options);

    expect(mockLogoutCallback).toHaveBeenCalledWith(req, res, options);
  });

  it('should handle /auth/token route', () => {
    req.url = '/auth/token';
    sso.handleRequest(req as IncomingMessage, res as ServerResponse, options);

    expect(mockToken).toHaveBeenCalledWith(req, res, options);
  });

  it('should call protectedRoute with roles and options', () => {
    const roles = ['Admin'];
    const protectedRouteOptions: ProtectedRouteOptions = { requireAllRoles: true };

    sso.protectedRoute(roles, protectedRouteOptions);

    expect(mockProtectedRoute).toHaveBeenCalledWith(roles, protectedRouteOptions);
  });
});

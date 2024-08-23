import { IncomingMessage, ServerResponse } from 'http';
import { login, loginCallback, logout, logoutCallback, token } from './controllers';
import { protectedRoute } from './protectedRoute';
import type { ProtectedRouteOptions, SSOOptions } from './types';

export class SSO {
  constructor() {
    // Initialization
  }

  public handleRequest(req: IncomingMessage, res: ServerResponse, options?: SSOOptions) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL ?? '');

    if (req.url?.startsWith('/auth/login/callback')) {
      loginCallback(req, res, options); // LOGIN CALLBACK
    } else if (req.url?.startsWith('/auth/login')) {
      login(req, res, options); // LOGIN
    } else if (req.url?.startsWith('/auth/logout/callback')) {
      logoutCallback(req, res, options); // LOGOUT CALLBACK
    } else if (req.url?.startsWith('/auth/logout')) {
      logout(req, res, options); // LOGOUT
    } else if (req.url?.startsWith('/auth/token')) {
      token(req, res, options); // TOKEN
    }
  }

  public protectedRoute(roles?: string[], options?: ProtectedRouteOptions) {
    return protectedRoute(roles, options);
  }
}

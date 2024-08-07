import { IncomingMessage, ServerResponse } from 'http';
import { ProtectedRouteOptions } from './types';
import {
  OriginalSSOUser,
  decodeJWT,
  hasAllRoles,
  hasAtLeastOneRole,
  isJWTValid,
  normalizeUser,
} from '@bcgov/citz-imb-sso-js-core';

import config from './config';
const { SSO_CLIENT_ID, SSO_CLIENT_SECRET } = config;

export const protectedRoute = (roles?: string[], options?: ProtectedRouteOptions) => {
  return async (req: IncomingMessage, res: ServerResponse, next: Function) => {
    // Extract Authorization header
    const header = req.headers['authorization'];
    if (!header) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'No authorization header found.' }));
      return;
    }

    // Extract token from header and check if it is valid
    const token = header.split(' ')[1];
    const isTokenValid = await isJWTValid({
      jwt: token,
      clientID: SSO_CLIENT_ID!,
      clientSecret: SSO_CLIENT_SECRET!,
    });
    if (!isTokenValid) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid token, re-log to get a new one.' }));
      return;
    }

    // Get user info and check role
    const userInfo = decodeJWT(token) as OriginalSSOUser<unknown>;
    const normalizedUser = normalizeUser(userInfo);
    if (!userInfo || !normalizedUser) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `User not found.` }));
      return;
    }
    const userRoles = userInfo?.client_roles;

    // Ensure proper use of function
    if (roles && (!Array.isArray(roles) || !roles.every((item) => typeof item === 'string'))) {
      throw new Error(`Error: protectedRoute middleware. Pass roles as an array of strings.`);
    }

    // Check for roles
    if (roles) {
      if (options && options.requireAllRoles === false) {
        if (!userRoles || !hasAtLeastOneRole(userRoles, roles)) {
          res.statusCode = 403;
          res.end(
            JSON.stringify({
              error: `User must have at least one of the following roles: [${roles}]`,
            }),
          );
          return;
        }
      } else {
        if (!userRoles || !hasAllRoles(userRoles, roles)) {
          res.statusCode = 403;
          res.end(
            JSON.stringify({ error: `User must have all of the following roles: [${roles}]` }),
          );
          return;
        }
      }
    }

    // Attach user info to the request object
    req.token = token;
    req.user = normalizedUser;

    // Pass control to the next middleware function
    next();
  };
};

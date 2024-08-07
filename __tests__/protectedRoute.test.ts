import { IncomingMessage, ServerResponse } from 'http';
import {
  decodeJWT,
  hasAllRoles,
  hasAtLeastOneRole,
  isJWTValid,
  normalizeUser,
} from '@bcgov/citz-imb-sso-js-core';
import { protectedRoute } from '@/protectedRoute';

jest.mock('@bcgov/citz-imb-sso-js-core');

jest.mock('@/config', () => ({
  SSO_CLIENT_ID: 'client_id',
  SSO_CLIENT_SECRET: 'client_secret',
}));

const mockIsJWTValid = isJWTValid as jest.Mock;
const mockDecodeJWT = decodeJWT as jest.Mock;
const mockNormalizeUser = normalizeUser as jest.Mock;
const mockHasAllRoles = hasAllRoles as jest.Mock;
const mockHasAtLeastOneRole = hasAtLeastOneRole as jest.Mock;

describe('protectedRoute middleware', () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      statusCode: 200,
      end: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header is present', async () => {
    req.headers = {};

    const middleware = protectedRoute();
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(res.statusCode).toBe(401);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ error: 'No authorization header found.' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if the token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalidtoken' };
    mockIsJWTValid.mockResolvedValue(false);

    const middleware = protectedRoute();
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(res.statusCode).toBe(401);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Unauthorized: Invalid token, re-log to get a new one.' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 if user info is not found', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);
    mockDecodeJWT.mockReturnValue(null);

    const middleware = protectedRoute();
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'User not found.' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if the user does not have the required roles (requireAllRoles: true)', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);
    mockDecodeJWT.mockReturnValue({ client_roles: ['User'] });
    mockNormalizeUser.mockReturnValue({ client_roles: ['User'] });
    mockHasAllRoles.mockReturnValue(false);

    const middleware = protectedRoute(['Admin'], { requireAllRoles: true });
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(res.statusCode).toBe(403);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ error: 'User must have all of the following roles: [Admin]' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if the user does not have at least one of the required roles (requireAllRoles: false)', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);
    mockDecodeJWT.mockReturnValue({ client_roles: ['User'] });
    mockNormalizeUser.mockReturnValue({ client_roles: ['User'] });
    mockHasAtLeastOneRole.mockReturnValue(false);

    const middleware = protectedRoute(['Admin', 'Super'], { requireAllRoles: false });
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(res.statusCode).toBe(403);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        error: 'User must have at least one of the following roles: [Admin,Super]',
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if the user is authenticated and has the required roles', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);
    mockDecodeJWT.mockReturnValue({ client_roles: ['Admin'] });
    mockNormalizeUser.mockReturnValue({ client_roles: ['Admin'] });
    mockHasAllRoles.mockReturnValue(true);

    const middleware = protectedRoute(['Admin']);
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(next).toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  it('should attach the user and token to the request object', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);
    mockDecodeJWT.mockReturnValue({ client_roles: ['Admin'] });
    mockNormalizeUser.mockReturnValue({ client_roles: ['Admin'] });
    mockHasAllRoles.mockReturnValue(true);

    const middleware = protectedRoute(['Admin']);
    await middleware(req as IncomingMessage, res as ServerResponse, next);

    expect(req.token).toBe('validtoken');
    expect(req.user).toEqual({ client_roles: ['Admin'] });
    expect(next).toHaveBeenCalled();
  });

  it('should throw an error if roles parameter is not an array of strings', async () => {
    req.headers = { authorization: 'Bearer validtoken' };
    mockIsJWTValid.mockResolvedValue(true);

    const middleware = protectedRoute('Admin' as unknown as string[]); // Improper use

    await expect(middleware(req as IncomingMessage, res as ServerResponse, next)).rejects.toThrow(
      'Error: protectedRoute middleware. Pass roles as an array of strings.',
    );

    expect(res.end).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

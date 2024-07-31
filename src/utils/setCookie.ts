import { SetCookieOptions } from '../types';
import { ServerResponse } from 'http';

export const setCookie = (
  res: ServerResponse,
  name: string,
  value: string,
  options: SetCookieOptions = {},
): void => {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.httpOnly) {
    cookie += `; HttpOnly`;
  }

  if (options.secure) {
    cookie += `; Secure`;
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  res.setHeader('Set-Cookie', cookie);
};

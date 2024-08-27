import { SetCookieOptions } from '../types';

export const formatCookie = (
  name: string,
  value: string,
  options: SetCookieOptions = {},
): string => {
  let cookie = `${name}=${value}`;

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

  return cookie;
};

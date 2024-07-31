export const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.split('=').map((c) => c.trim());
      cookies[name] = decodeURIComponent(value);
      return cookies;
    },
    {} as Record<string, string>,
  );
};

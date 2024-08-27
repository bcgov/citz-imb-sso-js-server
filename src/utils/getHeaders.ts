import type { IncomingMessage, IncomingHttpHeaders } from 'http';

export const getHeaders = (rawHeaders: IncomingMessage['rawHeaders']): IncomingHttpHeaders => {
  const headers: IncomingHttpHeaders = {};

  for (let i = 0; i < rawHeaders.length; i += 2) {
    const key = rawHeaders[i].toLowerCase();
    const value = rawHeaders[i + 1];

    // If the header already exists, convert it to an array to handle multiple values
    if (headers[key]) {
      if (Array.isArray(headers[key])) {
        (headers[key] as string[]).push(value);
      } else {
        headers[key] = [headers[key] as string, value];
      }
    } else {
      headers[key] = value;
    }
  }

  return headers;
};

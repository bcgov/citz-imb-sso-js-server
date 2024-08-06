import { IncomingMessage, ServerResponse } from 'http';
import { logoutCallback } from '@/controllers';
import { setCookie } from '@/utils';
import { SSOOptions } from '@/types';

jest.mock('@/config', () => ({
  FRONTEND_URL: 'http://localhost:3000',
  COOKIE_DOMAIN: 'localhost',
}));

jest.mock('@/utils', () => ({
  setCookie: jest.fn(),
}));

// Test suite for logoutCallback function
describe('logoutCallback function', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const options: SSOOptions = {};

  beforeEach(() => {
    req = {} as IncomingMessage;

    res = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;
  });

  // Test case: should remove the refresh token and redirect to the frontend
  it('should remove the refresh token and redirect to the frontend', async () => {
    await logoutCallback(req, res, options);

    expect(setCookie).toHaveBeenCalledWith(res, 'refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: 'localhost',
    });

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: 'http://localhost:3000' });
    expect(res.end).toHaveBeenCalled();
  });

  // Test case: should handle errors and respond with JSON
  it('should handle errors and respond with JSON', async () => {
    const error = new Error('Something went wrong');
    (setCookie as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await logoutCallback(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error: error.message }));
  });

  // Test case: should handle unexpected errors and respond with JSON
  it('should handle unexpected errors and respond with JSON', async () => {
    const error = 'Unexpected error';
    (setCookie as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await logoutCallback(req, res, options);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ success: false, error }));
  });
});

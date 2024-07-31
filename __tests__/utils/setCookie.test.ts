import { ServerResponse } from 'http';
import { setCookie } from '@/utils';

// Test suite for setCookie function
describe('setCookie', () => {
  let res: ServerResponse;

  beforeEach(() => {
    res = {
      setHeader: jest.fn(),
    } as unknown as ServerResponse;
  });

  // Test case: should set a simple cookie
  it('should set a simple cookie', () => {
    setCookie(res, 'name', 'value');

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value');
  });

  // Test case: should set a cookie with domain
  it('should set a cookie with domain', () => {
    setCookie(res, 'name', 'value', { domain: 'example.com' });

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value; Domain=example.com');
  });

  // Test case: should set a cookie with path
  it('should set a cookie with path', () => {
    setCookie(res, 'name', 'value', { path: '/path' });

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value; Path=/path');
  });

  // Test case: should set a cookie with expires
  it('should set a cookie with expires', () => {
    const expires = new Date();
    setCookie(res, 'name', 'value', { expires });

    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      `name=value; Expires=${expires.toUTCString()}`,
    );
  });

  // Test case: should set a cookie with httpOnly
  it('should set a cookie with httpOnly', () => {
    setCookie(res, 'name', 'value', { httpOnly: true });

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value; HttpOnly');
  });

  // Test case: should set a cookie with secure
  it('should set a cookie with secure', () => {
    setCookie(res, 'name', 'value', { secure: true });

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value; Secure');
  });

  // Test case: should set a cookie with sameSite
  it('should set a cookie with secure', () => {
    setCookie(res, 'name', 'value', { sameSite: 'None' });

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'name=value; SameSite=None');
  });

  // Test case: should set a cookie with multiple options
  it('should set a cookie with multiple options', () => {
    const expires = new Date();
    setCookie(res, 'name', 'value', {
      domain: 'example.com',
      path: '/path',
      expires,
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      `name=value; Domain=example.com; Path=/path; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=None`,
    );
  });
});

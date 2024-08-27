import { formatCookie } from '@/utils';

// Test suite for formatCookie function
describe('formatCookie', () => {
  // Test case: should create a simple cookie
  it('should create a simple cookie', () => {
    const result = formatCookie('name', 'value');

    expect(result).toBe('name=value');
  });

  // Test case: should create a cookie with domain
  it('should create a cookie with domain', () => {
    const result = formatCookie('name', 'value', { domain: 'example.com' });

    expect(result).toBe('name=value; Domain=example.com');
  });

  // Test case: should create a cookie with path
  it('should create a cookie with path', () => {
    const result = formatCookie('name', 'value', { path: '/path' });

    expect(result).toBe('name=value; Path=/path');
  });

  // Test case: should create a cookie with expires
  it('should create a cookie with expires', () => {
    const expires = new Date();
    const result = formatCookie('name', 'value', { expires });

    expect(result).toBe(`name=value; Expires=${expires.toUTCString()}`);
  });

  // Test case: should create a cookie with httpOnly
  it('should create a cookie with httpOnly', () => {
    const result = formatCookie('name', 'value', { httpOnly: true });

    expect(result).toBe('name=value; HttpOnly');
  });

  // Test case: should create a cookie with secure
  it('should create a cookie with secure', () => {
    const result = formatCookie('name', 'value', { secure: true });

    expect(result).toBe('name=value; Secure');
  });

  // Test case: should create a cookie with sameSite
  it('should create a cookie with secure', () => {
    const result = formatCookie('name', 'value', { sameSite: 'None' });

    expect(result).toBe('name=value; SameSite=None');
  });

  // Test case: should create a cookie with multiple options
  it('should create a cookie with multiple options', () => {
    const expires = new Date();
    const result = formatCookie('name', 'value', {
      domain: 'example.com',
      path: '/path',
      expires,
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    expect(result).toBe(
      `name=value; Domain=example.com; Path=/path; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=None`,
    );
  });
});

import { parseCookies } from '@/utils';

// Test suite for parseCookies function
describe('parseCookies', () => {
  // Test case: should return an empty object if cookieHeader is undefined
  it('should return an empty object if cookieHeader is undefined', () => {
    const result = parseCookies(undefined);
    expect(result).toEqual({});
  });

  // Test case: should parse a single cookie correctly
  it('should parse a single cookie correctly', () => {
    const cookieHeader = 'name=value';
    const result = parseCookies(cookieHeader);
    expect(result).toEqual({ name: 'value' });
  });

  // Test case: should parse multiple cookies correctly
  it('should parse multiple cookies correctly', () => {
    const cookieHeader = 'name1=value1; name2=value2';
    const result = parseCookies(cookieHeader);
    expect(result).toEqual({ name1: 'value1', name2: 'value2' });
  });

  // Test case: should decode URL-encoded cookie values
  it('should decode URL-encoded cookie values', () => {
    const cookieHeader = 'encodedName=%20value%20';
    const result = parseCookies(cookieHeader);
    expect(result).toEqual({ encodedName: ' value ' });
  });

  // Test case: should trim whitespace around cookie names and values
  it('should trim whitespace around cookie names and values', () => {
    const cookieHeader = '  name1  =  value1  ;  name2 =  value2  ';
    const result = parseCookies(cookieHeader);
    expect(result).toEqual({ name1: 'value1', name2: 'value2' });
  });

  // Test case: should handle cookies with empty values
  it('should handle cookies with empty values', () => {
    const cookieHeader = 'name=; anotherName=anotherValue';
    const result = parseCookies(cookieHeader);
    expect(result).toEqual({ name: '', anotherName: 'anotherValue' });
  });
});

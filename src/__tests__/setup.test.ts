/**
 * Basic setup test to verify Jest configuration
 */

describe('Setup Tests', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should work with TypeScript', () => {
    const message: string = 'Hello GarageLedger2!';
    expect(message).toContain('GarageLedger2');
  });

  test('should have Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
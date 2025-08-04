/**
 * Theme utilities test
 */
import { theme } from '../utils/theme';

describe('Theme Utilities', () => {
  test('should have basic theme colors', () => {
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.secondary).toBeDefined();
    expect(theme.colors.background).toBeDefined();
  });

  test('should have typography settings', () => {
    expect(theme.typography.fontFamily).toBeDefined();
    expect(theme.typography.fontSize).toBeDefined();
  });

  test('should have spacing values', () => {
    expect(theme.spacing.xs).toBeDefined();
    expect(theme.spacing.sm).toBeDefined();
    expect(theme.spacing.md).toBeDefined();
  });
});
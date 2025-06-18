import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Theme Colors
export const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  secondaryDark: '#475569',
  secondaryLight: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Background Colors
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  
  // Text Colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  
  // Border Colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',
  
  // Status Colors
  todo: '#f1f5f9',
  inProgress: '#dbeafe',
  done: '#dcfce7',
  
  // Priority Colors
  priorityLow: '#10b981',
  priorityMedium: '#f59e0b',
  priorityHigh: '#ef4444',
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Layout
export const layout = {
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 768,
  isLargeScreen: screenWidth >= 768,
  headerHeight: 60,
  tabBarHeight: 80,
  cardMinHeight: 80,
  columnWidth: Math.min(screenWidth * 0.85, 320),
};

// Global Styles
export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  cardPressed: {
    backgroundColor: colors.surfaceVariant,
    transform: [{ scale: 0.98 }],
  },
  
  // Button Styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.textPrimary,
  },
  buttonDisabled: {
    backgroundColor: colors.secondaryLight,
    opacity: 0.6,
  },
  
  // Input Styles
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  
  // Text Styles
  text: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
  },
  textBold: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
  },
  textCenter: {
    textAlign: 'center',
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  
  // Spacing Utilities
  marginTop: {
    marginTop: spacing.md,
  },
  marginBottom: {
    marginBottom: spacing.md,
  },
  marginLeft: {
    marginLeft: spacing.md,
  },
  marginRight: {
    marginRight: spacing.md,
  },
  padding: {
    padding: spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  paddingVertical: {
    paddingVertical: spacing.md,
  },
  
  // Status Styles
  statusTodo: {
    backgroundColor: colors.todo,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  statusInProgress: {
    backgroundColor: colors.inProgress,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statusDone: {
    backgroundColor: colors.done,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  // Priority Styles
  priorityLow: {
    backgroundColor: colors.priorityLow + '20',
    borderColor: colors.priorityLow,
  },
  priorityMedium: {
    backgroundColor: colors.priorityMedium + '20',
    borderColor: colors.priorityMedium,
  },
  priorityHigh: {
    backgroundColor: colors.priorityHigh + '20',
    borderColor: colors.priorityHigh,
  },
  
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

// Responsive Utilities
export const responsive = {
  // Responsive font sizes
  fontSize: (size: keyof typeof typography.fontSize) => {
    if (layout.isSmallScreen) {
      return typography.fontSize[size] * 0.9;
    }
    if (layout.isLargeScreen) {
      return typography.fontSize[size] * 1.1;
    }
    return typography.fontSize[size];
  },
  
  // Responsive spacing
  spacing: (size: keyof typeof spacing) => {
    if (layout.isSmallScreen) {
      return spacing[size] * 0.8;
    }
    if (layout.isLargeScreen) {
      return spacing[size] * 1.2;
    }
    return spacing[size];
  },
  
  // Responsive padding
  padding: {
    horizontal: layout.isSmallScreen ? spacing.sm : spacing.md,
    vertical: layout.isSmallScreen ? spacing.sm : spacing.md,
  },
};

// Animation Configurations
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default globalStyles; 
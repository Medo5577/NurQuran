// Powered by OnSpace.AI
export const Colors = {
  // Primary Palette
  primary: '#C9A84C',       // Islamic Gold
  primaryLight: '#E8C97A',  // Light Gold
  primaryDark: '#A07830',   // Deep Gold
  
  // Surface Palette
  background: '#0D1117',    // Deep Navy Black
  surface: '#161B22',       // Card Surface
  surfaceElevated: '#1E2530', // Elevated Card
  surfaceBorder: '#2A3441',  // Subtle Border
  
  // Text
  textPrimary: '#F0E6CC',   // Warm White
  textSecondary: '#9BA8B5', // Muted Blue-Gray
  textMuted: '#5A6978',     // Very Muted
  textArabic: '#E8D5A3',    // Arabic text warm tone
  textGold: '#C9A84C',      // Gold text
  
  // Semantic
  success: '#4CAF76',
  error: '#E05252',
  warning: '#E8A84C',
  info: '#5294E0',
  
  // Islamic Accents
  emerald: '#2ECC71',
  teal: '#1A8C6E',
  
  // Overlay
  overlay: 'rgba(13, 17, 23, 0.85)',
  overlayLight: 'rgba(201, 168, 76, 0.08)',
};

export const Typography = {
  // Arabic Font Sizes
  arabicXL: 36,
  arabicLG: 28,
  arabicMD: 22,
  arabicSM: 18,
  
  // Latin Font Sizes
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  body: 15,
  bodyLG: 16,
  caption: 13,
  small: 12,
  
  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

export const Shadow = {
  card: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

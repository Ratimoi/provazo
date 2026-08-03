import { CORES_TIPO } from '../domain/cores';

export const colors = {
  brand: '#4F46E5',
  brandDark: '#3730A3',
  brandSoft: '#EEF2FF',
  tipo: CORES_TIPO,
  ink: '#18181B',
  inkSoft: '#71717A',
  inkFaint: '#A1A1AA',
  line: '#E4E4E7',
  lineSoft: '#EDEDF0',
  surface: '#FFFFFF',
  surfaceSunken: '#F4F4F6',
  bg: '#FAFAFA',
  success: '#10B981',
  danger: '#EF4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const font = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
};

export const shadow = {
  card: {
    shadowColor: '#18181B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#4F46E5',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

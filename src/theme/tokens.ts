import { CORES_TIPO } from '../domain/cores';

export const colors = {
  brand: '#BD5529',
  brandDark: '#96300B',
  brandSoft: '#FBEDE6',
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

/** Escolhe texto claro ou escuro conforme o brilho do fundo, pra evitar
 * baixo contraste em cima de cores claras da paleta (âmbar, lima...). */
export function corDeTexto(corFundoHex: string): string {
  const r = parseInt(corFundoHex.slice(1, 3), 16);
  const g = parseInt(corFundoHex.slice(3, 5), 16);
  const b = parseInt(corFundoHex.slice(5, 7), 16);
  const brilho = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brilho > 0.6 ? colors.ink : colors.surface;
}

export const shadow = {
  card: {
    shadowColor: '#18181B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#BD5529',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#18181B',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
};

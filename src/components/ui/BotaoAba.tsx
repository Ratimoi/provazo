import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // Props do botão padrão da navegação que o Pressable do RN não conhece.
  href?: string;
  pressColor?: unknown;
  pressOpacity?: unknown;
  hoverEffect?: unknown;
};

/**
 * Botão da barra de abas com o feedback de toque contido no próprio botão. O
 * padrão do Android usa um ripple "sem borda" que vaza do botão e vira um
 * círculo grande correndo por baixo dos ícones; aqui o ripple é recortado na
 * área do botão, com cantos arredondados e a cor da marca.
 */
export function BotaoAba({
  children,
  style,
  href,
  pressColor,
  pressOpacity,
  hoverEffect,
  android_ripple,
  ...resto
}: Props) {
  void href;
  void pressColor;
  void pressOpacity;
  void hoverEffect;
  void android_ripple;
  return (
    <Pressable
      {...resto}
      android_ripple={{ color: 'rgba(107, 37, 69, 0.14)', borderless: false }}
      style={[style, { borderRadius: 16, overflow: 'hidden' }]}
    >
      {children}
    </Pressable>
  );
}

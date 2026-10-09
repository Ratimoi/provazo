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
 * Botão da barra de abas com feedback de toque discreto. O padrão do Android
 * usa um ripple "sem borda" que vaza do botão (um círculo grande sob os
 * ícones), e um ripple recortado é desenhado por cima do conteúdo e tampa o
 * ícone e o texto. Aqui não há ripple: só um fundo suave, por trás do
 * conteúdo, enquanto o dedo está apertando.
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
      android_ripple={null}
      style={({ pressed }) => [
        style,
        { borderRadius: 16 },
        pressed && { backgroundColor: 'rgba(107, 37, 69, 0.07)' },
      ]}
    >
      {children}
    </Pressable>
  );
}

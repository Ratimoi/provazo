import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadow, spacing } from '../../theme/tokens';

const DURACAO_MS = 220;
const DESLOCAMENTO_INICIAL = 420;

/**
 * Modal em folha (bottom sheet) com o fundo escurecendo em fade enquanto a
 * folha desliza de baixo — o Modal nativo do RN (`animationType="slide"`)
 * anima os dois juntos como se fossem uma coisa só, o que faz o fundo
 * escuro "subir" em vez de só aparecer.
 */
export function BottomSheetModal({
  visivel,
  aoFechar,
  children,
}: {
  visivel: boolean;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  const [montado, setMontado] = useState(visivel);
  const opacidadeFundo = useRef(new Animated.Value(0)).current;
  const posicaoFolha = useRef(new Animated.Value(DESLOCAMENTO_INICIAL)).current;

  useEffect(() => {
    if (visivel) {
      setMontado(true);
      Animated.parallel([
        Animated.timing(opacidadeFundo, {
          toValue: 1,
          duration: DURACAO_MS,
          useNativeDriver: true,
        }),
        Animated.timing(posicaoFolha, {
          toValue: 0,
          duration: DURACAO_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (montado) {
      Animated.parallel([
        Animated.timing(opacidadeFundo, {
          toValue: 0,
          duration: DURACAO_MS,
          useNativeDriver: true,
        }),
        Animated.timing(posicaoFolha, {
          toValue: DESLOCAMENTO_INICIAL,
          duration: DURACAO_MS,
          useNativeDriver: true,
        }),
      ]).start(() => setMontado(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel]);

  if (!montado) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={aoFechar}
    >
      {/* behavior="height" encolhe essa view quando o teclado abre — como o
       * Modal do RN tem janela nativa própria no Android, ela não se
       * redimensiona sozinha como uma tela comum, então sem isso o teclado
       * cobre o campo em edição. */}
      <KeyboardAvoidingView
        style={styles.raiz}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[styles.fundo, { opacity: opacidadeFundo }]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
        <View style={styles.ancora} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.folhaAnimada,
              { transform: [{ translateY: posicaoFolha }] },
            ]}
          >
            <View style={styles.folhaRecorte}>
              <SafeAreaView style={styles.folha} edges={['bottom']}>
                {children}
              </SafeAreaView>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  fundo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24,24,27,0.4)',
  },
  ancora: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  // A sombra e o cantos arredondados precisam estar na mesma view — se o
  // arredondamento fica só no filho (ou some com overflow:hidden aqui),
  // a sombra é desenhada como um retângulo reto por baixo do cartão
  // arredondado, e o "enquadramento" fica errado.
  folhaAnimada: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    ...shadow.sheet,
  },
  folhaRecorte: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  folha: {
    backgroundColor: colors.bg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
});

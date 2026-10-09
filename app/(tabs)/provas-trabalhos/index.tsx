import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacoesTab } from '../../../src/components/provas/AvaliacoesTab';
import { MateriasTab } from '../../../src/components/provas/MateriasTab';
import { TarefasTab } from '../../../src/components/provas/TarefasTab';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';
import { colors, font, spacing } from '../../../src/theme/tokens';

type Aba = 'avaliacoes' | 'materias' | 'tarefas';

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'avaliacoes', rotulo: 'Avaliações' },
  { valor: 'materias', rotulo: 'Matérias' },
  { valor: 'tarefas', rotulo: 'Tarefas' },
];

/** Casca da página: título, semestre e abas internas; o conteúdo vive em cada aba. */
export default function ProvasTrabalhosScreen() {
  const { selecionado, semestre, irParaAnterior, irParaProximo } =
    useSemestreSelecionado();
  const [aba, setAba] = useState<Aba>('avaliacoes');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Provas e Trabalhos</Text>
          <View style={styles.seletor}>
            <Pressable onPress={irParaAnterior} hitSlop={12}>
              <Ionicons name="chevron-back" size={18} color={colors.brand} />
            </Pressable>
            <Text style={styles.periodo}>
              {selecionado.anoValor} · {selecionado.numero}º semestre
            </Text>
            <Pressable onPress={irParaProximo} hitSlop={12}>
              <Ionicons name="chevron-forward" size={18} color={colors.brand} />
            </Pressable>
          </View>
          <View style={styles.abas}>
            <SegmentedControl opcoes={ABAS} valor={aba} aoMudar={setAba} />
          </View>
        </View>

        {aba === 'avaliacoes' && <AvaliacoesTab semestreId={semestre.id} />}
        {aba === 'materias' && <MateriasTab semestreId={semestre.id} />}
        {aba === 'tarefas' && <TarefasTab />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  cabecalho: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 26,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  periodo: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  abas: {
    marginTop: spacing.md,
  },
});

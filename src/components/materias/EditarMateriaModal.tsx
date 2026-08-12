import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PALETA_MATERIAS, type Materia } from '../../domain/materias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

export function EditarMateriaModal({
  visivel,
  materia,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: {
  visivel: boolean;
  materia: Materia | null;
  salvando?: boolean;
  erro?: string | null;
  aoFechar: () => void;
  aoSalvar: (nome: string, corHex: string) => void;
}) {
  const [nome, setNome] = useState('');
  const [corSelecionada, setCorSelecionada] = useState<string | null>(null);

  // Toda abertura reflete a matéria atual, independente de como a anterior
  // terminou (mesmo cuidado do NovaMateriaModal).
  useEffect(() => {
    if (visivel && materia) {
      setNome(materia.nome);
      setCorSelecionada(materia.corHex);
    }
  }, [visivel, materia]);

  if (!materia) return null;

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent
      onRequestClose={aoFechar}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.folha} edges={['bottom']}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Editar matéria</Text>
            <Pressable onPress={aoFechar} hitSlop={10}>
              <Text style={styles.fechar}>Cancelar</Text>
            </Pressable>
          </View>

          <Text style={styles.rotulo}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Cálculo 2"
            value={nome}
            onChangeText={setNome}
            autoFocus
          />

          <Text style={styles.rotulo}>Cor</Text>
          <View style={styles.cores}>
            {PALETA_MATERIAS.map((cor) => (
              <Pressable
                key={cor}
                onPress={() => setCorSelecionada(cor)}
                style={[
                  styles.corSwatch,
                  { backgroundColor: cor },
                  corSelecionada === cor && styles.corSwatchSelecionada,
                ]}
              />
            ))}
          </View>

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <Pressable
            style={styles.botaoSalvar}
            onPress={() => aoSalvar(nome, corSelecionada ?? materia.corHex)}
            disabled={salvando}
          >
            <Text style={styles.botaoSalvarTexto}>
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,24,27,0.4)',
    justifyContent: 'flex-end',
  },
  folha: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
  },
  fechar: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  corSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchSelecionada: {
    borderColor: colors.ink,
  },
  erro: {
    fontFamily: font.bodyMedium,
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.md,
  },
  botaoSalvar: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadow.floating,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Tarefa } from '../../domain/tarefas';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

export function EditarTarefaModal({
  visivel,
  tarefa,
  salvando,
  aoFechar,
  aoSalvar,
}: {
  visivel: boolean;
  tarefa: Tarefa | null;
  salvando?: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: { titulo: string; observacoes: string | null }) => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Toda abertura reflete a tarefa atual, mesmo cuidado dos outros EditarXModal.
  useEffect(() => {
    if (visivel && tarefa) {
      setTitulo(tarefa.titulo);
      setObservacoes(tarefa.observacoes ?? '');
      setErro(null);
    }
  }, [visivel, tarefa]);

  if (!tarefa) return null;

  function handleSalvar() {
    const tituloLimpo = titulo.trim();
    if (tituloLimpo.length === 0) {
      setErro('Dê um título pra essa tarefa.');
      return;
    }
    setErro(null);
    aoSalvar({ titulo: tituloLimpo, observacoes: observacoes.trim() || null });
  }

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Editar tarefa</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Cancelar</Text>
        </Pressable>
      </View>

      <Text style={styles.rotulo}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da tarefa"
        value={titulo}
        onChangeText={setTitulo}
        autoFocus
      />

      <Text style={styles.rotulo}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textoMultilinha]}
        placeholder="Observações"
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
      />

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable
        style={styles.botaoSalvar}
        onPress={handleSalvar}
        disabled={salvando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
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
  textoMultilinha: {
    minHeight: 70,
    textAlignVertical: 'top',
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

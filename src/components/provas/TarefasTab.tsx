import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { apagarTarefasConcluidas } from '../../domain/sistema';
import type { Tarefa } from '../../domain/tarefas';
import { useTarefas } from '../../hooks/useTarefas';
import { useTarefasMutations } from '../../hooks/useTarefasMutations';
import { colors, font, spacing } from '../../theme/tokens';
import { EditarTarefaModal } from '../tarefas/EditarTarefaModal';
import { TarefasSection } from '../tarefas/TarefasSection';
import { ConfirmModal } from '../ui/ConfirmModal';

/** Aba "Tarefas": lista solta de coisas a fazer, sem data. */
export function TarefasTab() {
  const { data: tarefas = [] } = useTarefas();
  const mutacoes = useTarefasMutations();
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  const concluidas = tarefas.filter((t) => t.concluida).length;

  return (
    <View style={styles.raiz}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <TarefasSection
          tarefas={tarefas}
          aoCriar={(titulo) => mutacoes.criar.mutate(titulo)}
          aoAlternar={(id, concluida) => mutacoes.alternar.mutate({ id, concluida })}
          aoExcluir={(id) => mutacoes.excluir.mutate(id)}
          aoEditar={setEditando}
          aoLimparConcluidas={() => setConfirmarLimpeza(true)}
        />
        {tarefas.length > 0 && (
          <Text style={styles.dica}>
            Segure numa tarefa pra editar título e descrição
          </Text>
        )}
      </ScrollView>

      <EditarTarefaModal
        visivel={editando !== null}
        tarefa={editando}
        salvando={mutacoes.editar.isPending}
        aoFechar={() => setEditando(null)}
        aoSalvar={(dados) => {
          if (!editando) return;
          mutacoes.editar.mutate(
            { id: editando.id, dados },
            { onSuccess: () => setEditando(null) },
          );
        }}
      />
      <ConfirmModal
        visivel={confirmarLimpeza}
        titulo="Apagar tarefas concluídas?"
        mensagem={`${concluidas} tarefa${concluidas === 1 ? '' : 's'} concluída${concluidas === 1 ? '' : 's'} ser${concluidas === 1 ? 'á' : 'ão'} apagada${concluidas === 1 ? '' : 's'}.`}
        textoConfirmar="Apagar"
        destrutivo
        aoConfirmar={() => {
          apagarTarefasConcluidas();
          setConfirmarLimpeza(false);
        }}
        aoCancelar={() => setConfirmarLimpeza(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 48,
    gap: spacing.md,
  },
  dica: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});

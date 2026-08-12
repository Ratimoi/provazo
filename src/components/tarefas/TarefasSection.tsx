import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Tarefa } from '../../domain/tarefas';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

export function TarefasSection({
  tarefas,
  aoCriar,
  aoAlternar,
  aoExcluir,
}: {
  tarefas: Tarefa[];
  aoCriar: (titulo: string) => void;
  aoAlternar: (id: number, concluida: boolean) => void;
  aoExcluir: (id: number) => void;
}) {
  const [novoTitulo, setNovoTitulo] = useState('');

  function handleAdicionar() {
    const titulo = novoTitulo.trim();
    if (titulo.length === 0) return;
    aoCriar(titulo);
    setNovoTitulo('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.secaoTitulo}>Tarefas</Text>

      <View style={styles.linhaInput}>
        <TextInput
          style={styles.input}
          placeholder="Ex: Continuar o learncpp"
          value={novoTitulo}
          onChangeText={setNovoTitulo}
          onSubmitEditing={handleAdicionar}
          returnKeyType="done"
        />
        <Pressable
          style={({ pressed }) => [
            styles.botaoAdicionar,
            pressed && styles.pressed,
          ]}
          onPress={handleAdicionar}
        >
          <Ionicons name="add" size={20} color={colors.surface} />
        </Pressable>
      </View>

      {tarefas.length === 0 ? (
        <Text style={styles.vazioTexto}>Nenhuma tarefa por aqui.</Text>
      ) : (
        <View style={styles.lista}>
          {tarefas.map((tarefa) => (
            <View key={tarefa.id} style={styles.item}>
              <Pressable
                hitSlop={8}
                onPress={() => aoAlternar(tarefa.id, !tarefa.concluida)}
                style={[
                  styles.checkbox,
                  tarefa.concluida && styles.checkboxMarcado,
                ]}
              >
                {tarefa.concluida && (
                  <Ionicons name="checkmark" size={14} color={colors.surface} />
                )}
              </Pressable>
              <Text
                style={[
                  styles.itemTexto,
                  tarefa.concluida && styles.itemTextoConcluido,
                ]}
              >
                {tarefa.titulo}
              </Text>
              <Pressable hitSlop={8} onPress={() => aoExcluir(tarefa.id)}>
                <Ionicons name="close" size={16} color={colors.inkFaint} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linhaInput: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  botaoAdicionar: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkFaint,
  },
  lista: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...shadow.card,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm - 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemTexto: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.ink,
  },
  itemTextoConcluido: {
    color: colors.inkFaint,
    textDecorationLine: 'line-through',
  },
});

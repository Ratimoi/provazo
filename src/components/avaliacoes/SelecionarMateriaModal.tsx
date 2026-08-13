import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Materia } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

/** Ignora acentos na busca, pra "calculo" achar "Cálculo". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function SelecionarMateriaModal({
  visivel,
  materias,
  materiaSelecionadaId,
  aoFechar,
  aoSelecionar,
}: {
  visivel: boolean;
  materias: Materia[];
  materiaSelecionadaId: number | null;
  aoFechar: () => void;
  aoSelecionar: (id: number) => void;
}) {
  const [busca, setBusca] = useState('');

  const materiasFiltradas = useMemo(() => {
    const termo = normalizar(busca);
    if (termo.length === 0) return materias;
    return materias.filter(
      (m) =>
        normalizar(m.nome).includes(termo) ||
        (m.instituicao && normalizar(m.instituicao).includes(termo)),
    );
  }, [materias, busca]);

  function selecionar(id: number) {
    aoSelecionar(id);
    setBusca('');
    aoFechar();
  }

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Escolher matéria</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Fechar</Text>
        </Pressable>
      </View>

      {materias.length > 5 && (
        <View style={styles.busca}>
          <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por matéria ou instituição…"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
            autoFocus
          />
          {busca.length > 0 && (
            <Pressable onPress={() => setBusca('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.inkFaint} />
            </Pressable>
          )}
        </View>
      )}

      {materiasFiltradas.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma matéria encontrada.</Text>
      ) : (
        <ScrollView style={styles.lista} keyboardShouldPersistTaps="handled">
          {materiasFiltradas.map((materia) => {
            const selecionada = materia.id === materiaSelecionadaId;
            return (
              <Pressable
                key={materia.id}
                onPress={() => selecionar(materia.id)}
                style={({ pressed }) => [
                  styles.linha,
                  selecionada && styles.linhaSelecionada,
                  pressed && styles.linhaPressed,
                ]}
              >
                <View style={[styles.dot, { backgroundColor: materia.corHex }]} />
                <View style={styles.linhaTextos}>
                  <Text style={styles.linhaNome} numberOfLines={1}>
                    {materia.nome}
                  </Text>
                  {materia.instituicao && (
                    <Text style={styles.linhaInstituicao} numberOfLines={1}>
                      {materia.instituicao}
                    </Text>
                  )}
                </View>
                {selecionada && (
                  <Ionicons name="checkmark" size={18} color={colors.brand} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
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
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  buscaInput: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  vazio: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkFaint,
    paddingVertical: spacing.md,
  },
  lista: {
    maxHeight: 360,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
  linhaSelecionada: {
    backgroundColor: colors.brandSoft,
  },
  linhaPressed: {
    opacity: 0.7,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  linhaTextos: {
    flex: 1,
    gap: 1,
  },
  linhaNome: {
    fontFamily: font.bodySemibold,
    fontSize: 15,
    color: colors.ink,
  },
  linhaInstituicao: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
});

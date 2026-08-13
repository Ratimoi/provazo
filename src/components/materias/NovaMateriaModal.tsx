import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PALETA_MATERIAS } from '../../domain/materias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

export function NovaMateriaModal({
  visivel,
  salvando,
  erro,
  instituicoesSugeridas = [],
  aoFechar,
  aoSalvar,
}: {
  visivel: boolean;
  salvando?: boolean;
  erro?: string | null;
  /** Instituições já usadas em outras matérias, pra reaproveitar em vez de retitar. */
  instituicoesSugeridas?: string[];
  aoFechar: () => void;
  aoSalvar: (
    nome: string,
    corHex: string | null,
    instituicao: string | null,
  ) => void;
}) {
  const [nome, setNome] = useState('');
  const [corSelecionada, setCorSelecionada] = useState<string | null>(null);
  const [instituicao, setInstituicao] = useState('');

  // Toda abertura começa limpa, independente de como a anterior terminou
  // (sucesso não passa pelo handleFechar, então sem isso os campos ficavam
  // com o valor do cadastro passado).
  useEffect(() => {
    if (visivel) {
      setNome('');
      setCorSelecionada(null);
      setInstituicao('');
    }
  }, [visivel]);

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Nova matéria</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Cancelar</Text>
        </Pressable>
      </View>

      <Text style={styles.rotulo}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Nova matéria"
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

      <Text style={styles.rotulo}>Instituição (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: USP, Uninove…"
        value={instituicao}
        onChangeText={setInstituicao}
      />
      {instituicoesSugeridas.length > 0 && (
        <View style={styles.chipsInstituicao}>
          {instituicoesSugeridas.map((sugestao) => (
            <Pressable
              key={sugestao}
              onPress={() => setInstituicao(sugestao)}
              style={[
                styles.chip,
                instituicao === sugestao && styles.chipAtivo,
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  instituicao === sugestao && styles.chipTextoAtivo,
                ]}
              >
                {sugestao}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable
        style={styles.botaoSalvar}
        onPress={() =>
          aoSalvar(nome, corSelecionada, instituicao.trim() || null)
        }
        disabled={salvando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando…' : 'Criar matéria'}
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
  chipsInstituicao: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
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

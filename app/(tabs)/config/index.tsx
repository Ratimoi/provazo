import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApagarAvaliacoesAntigasModal } from '../../../src/components/config/ApagarAvaliacoesAntigasModal';
import { ApagarSemestreModal } from '../../../src/components/config/ApagarSemestreModal';
import { ResetFabricaModal } from '../../../src/components/config/ResetFabricaModal';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { HoraInput } from '../../../src/components/ui/HoraInput';
import { restaurarBackup } from '../../../src/domain/backup';
import { exportarBackup, lerArquivoDeBackup } from '../../../src/domain/backupArquivo';
import { type Backup, resumirBackup } from '../../../src/domain/backupFormato';
import { pedirPermissao } from '../../../src/domain/lembretes';
import {
  definirHoraLembrete,
  definirLembretesAtivos,
  horaLembrete,
  lembretesAtivos,
} from '../../../src/domain/preferencias';
import { horaValida } from '../../../src/domain/validacao';
import { deleteSemestre } from '../../../src/domain/semestres';
import {
  apagarAvaliacoesAntesDe,
  apagarTarefasConcluidas,
  contarDados,
  contarTarefasConcluidas,
  listTodosSemestres,
  restaurarPadraoDeFabrica,
  type SemestreComContagem,
} from '../../../src/domain/sistema';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

const ROTULOS_RESUMO: { chave: keyof ReturnType<typeof contarDados>; rotulo: string }[] = [
  { chave: 'materias', rotulo: 'Matérias' },
  { chave: 'avaliacoes', rotulo: 'Avaliações' },
  { chave: 'aulas', rotulo: 'Aulas fixas' },
  { chave: 'compromissosAvulsos', rotulo: 'Compromissos' },
  { chave: 'tarefas', rotulo: 'Tarefas' },
];

export default function ConfiguracoesScreen() {
  const [versao, setVersao] = useState(0);

  const resumo = useMemo(() => contarDados(), [versao]); // eslint-disable-line react-hooks/exhaustive-deps
  const semestres = useMemo(() => listTodosSemestres(), [versao]); // eslint-disable-line react-hooks/exhaustive-deps
  const tarefasConcluidas = useMemo(() => contarTarefasConcluidas(), [versao]); // eslint-disable-line react-hooks/exhaustive-deps

  // As abas ficam montadas em segundo plano, então estas contagens ficariam
  // congeladas no valor de quando a tela abriu pela primeira vez. Recalcula a
  // cada vez que a aba ganha foco.
  useFocusEffect(
    useCallback(() => {
      setVersao((v) => v + 1);
    }, []),
  );

  const [modalAvaliacoesAntigas, setModalAvaliacoesAntigas] = useState(false);
  const [modalSemestre, setModalSemestre] = useState(false);
  const [confirmExcluirSemestre, setConfirmExcluirSemestre] =
    useState<SemestreComContagem | null>(null);
  const [confirmTarefasConcluidas, setConfirmTarefasConcluidas] = useState(false);
  const [backupPendente, setBackupPendente] = useState<Backup | null>(null);
  const [lembretesLigados, setLembretesLigados] = useState(() => lembretesAtivos());
  const [horaAviso, setHoraAviso] = useState(() => horaLembrete());
  const [modalResetFabrica, setModalResetFabrica] = useState(false);

  // As outras telas atualizam sozinhas: toda escrita no banco invalida as
  // consultas (listener em app/_layout.tsx). Aqui só refaz as contagens.
  function atualizarTudo() {
    setVersao((v) => v + 1);
  }

  function handleApagarAvaliacoesAntigas(dataCorte: string) {
    apagarAvaliacoesAntesDe(dataCorte);
    setModalAvaliacoesAntigas(false);
    atualizarTudo();
  }

  function handleExcluirSemestreSolicitado(semestre: SemestreComContagem) {
    setConfirmExcluirSemestre(semestre);
    setModalSemestre(false);
  }

  function confirmarExclusaoSemestre() {
    if (!confirmExcluirSemestre) return;
    deleteSemestre(confirmExcluirSemestre.id);
    setConfirmExcluirSemestre(null);
    atualizarTudo();
  }

  function confirmarApagarTarefasConcluidas() {
    apagarTarefasConcluidas();
    setConfirmTarefasConcluidas(false);
    atualizarTudo();
  }

  async function alternarLembretes(ligar: boolean) {
    if (ligar && !(await pedirPermissao())) {
      Alert.alert(
        'Permissão necessária',
        'Ative as notificações do Provazo nas configurações do Android pra receber os lembretes.',
      );
      return;
    }
    definirLembretesAtivos(ligar);
    setLembretesLigados(ligar);
  }

  function alterarHoraAviso(hora: string) {
    setHoraAviso(hora);
    if (horaValida(hora)) definirHoraLembrete(hora);
  }

  async function handleExportarBackup() {
    try {
      await exportarBackup(Constants.expoConfig?.version ?? '?');
    } catch (e) {
      Alert.alert(
        'Não deu pra exportar',
        e instanceof Error ? e.message : 'Tente de novo.',
      );
    }
  }

  async function handleImportarBackup() {
    const leitura = await lerArquivoDeBackup();
    if (leitura.status === 'erro') {
      Alert.alert('Backup inválido', leitura.erro);
    } else if (leitura.status === 'ok') {
      setBackupPendente(leitura.backup);
    }
  }

  function confirmarImportarBackup() {
    if (!backupPendente) return;
    try {
      restaurarBackup(backupPendente);
      atualizarTudo();
      Alert.alert('Backup restaurado', 'Seus dados foram substituídos pelos do arquivo.');
    } catch (e) {
      Alert.alert(
        'Não deu pra restaurar',
        `${e instanceof Error ? e.message : 'Erro desconhecido.'} Seus dados atuais foram mantidos.`,
      );
    }
    setBackupPendente(null);
  }

  function confirmarResetFabrica() {
    restaurarPadraoDeFabrica();
    setModalResetFabrica(false);
    atualizarTudo();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.tituloPagina}>Configurações</Text>

        <View style={styles.cartaoResumo}>
          {ROTULOS_RESUMO.map((item) => (
            <View key={item.chave} style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>{resumo[item.chave]}</Text>
              <Text style={styles.resumoRotulo}>{item.rotulo}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.secaoTitulo}>Dados</Text>
        <View style={styles.grupo}>
          <Linha
            icone="calendar-outline"
            texto="Apagar avaliações antigas"
            descricao="Escolha uma data de corte"
            onPress={() => setModalAvaliacoesAntigas(true)}
          />
          <Linha
            icone="checkmark-done-outline"
            texto="Apagar tarefas concluídas"
            descricao={
              tarefasConcluidas === 0
                ? 'Nenhuma concluída no momento'
                : `${tarefasConcluidas} tarefa${tarefasConcluidas === 1 ? '' : 's'} concluída${tarefasConcluidas === 1 ? '' : 's'}`
            }
            desabilitado={tarefasConcluidas === 0}
            onPress={() => setConfirmTarefasConcluidas(true)}
          />
          <Linha
            icone="albums-outline"
            texto="Apagar um semestre"
            descricao="Matérias, avaliações e aulas dele"
            onPress={() => setModalSemestre(true)}
          />
        </View>

        <Text style={styles.secaoTitulo}>Lembretes</Text>
        <View style={styles.grupo}>
          <View style={styles.linha}>
            <View style={styles.linhaIconeContainer}>
              <Ionicons name="notifications-outline" size={18} color={colors.ink} />
            </View>
            <View style={styles.linhaTextos}>
              <Text style={styles.linhaTexto}>Avisar sobre provas e trabalhos</Text>
              <Text style={styles.linhaDescricao}>
                Escolha quando avisar em cada avaliação
              </Text>
            </View>
            <Switch
              value={lembretesLigados}
              onValueChange={alternarLembretes}
              trackColor={{ true: colors.brand }}
            />
          </View>
          {lembretesLigados && (
            <View style={styles.linha}>
              <View style={styles.linhaIconeContainer}>
                <Ionicons name="alarm-outline" size={18} color={colors.ink} />
              </View>
              <View style={styles.linhaTextos}>
                <Text style={styles.linhaTexto}>Horário do aviso</Text>
                <Text style={styles.linhaDescricao}>
                  Para os avisos de &quot;X dias antes&quot;
                </Text>
              </View>
              <HoraInput
                style={styles.inputHora}
                value={horaAviso}
                onChangeText={alterarHoraAviso}
              />
            </View>
          )}
        </View>

        <Text style={styles.secaoTitulo}>Backup</Text>
        <View style={styles.grupo}>
          <Linha
            icone="share-outline"
            texto="Exportar backup"
            descricao="Salva tudo num arquivo pra guardar ou enviar"
            onPress={handleExportarBackup}
          />
          <Linha
            icone="download-outline"
            texto="Importar backup"
            descricao="Substitui os dados atuais pelos de um arquivo"
            onPress={handleImportarBackup}
          />
        </View>

        <Text style={styles.secaoTitulo}>Zona de risco</Text>
        <View style={styles.grupo}>
          <Linha
            icone="nuclear-outline"
            texto="Restaurar padrão de fábrica"
            descricao="Apaga tudo — não dá pra desfazer"
            destrutivo
            onPress={() => setModalResetFabrica(true)}
          />
        </View>

        <Text style={styles.secaoTitulo}>Sobre</Text>
        <View style={styles.grupo}>
          <View style={styles.linhaSobre}>
            <Text style={styles.linhaTexto}>Provazo</Text>
            <Text style={styles.linhaDescricao}>
              versão {Constants.expoConfig?.version ?? '—'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ApagarAvaliacoesAntigasModal
        visivel={modalAvaliacoesAntigas}
        aoFechar={() => setModalAvaliacoesAntigas(false)}
        aoConfirmar={handleApagarAvaliacoesAntigas}
      />
      <ApagarSemestreModal
        visivel={modalSemestre}
        semestres={semestres}
        aoFechar={() => setModalSemestre(false)}
        aoExcluir={handleExcluirSemestreSolicitado}
      />
      <ResetFabricaModal
        visivel={modalResetFabrica}
        aoFechar={() => setModalResetFabrica(false)}
        aoConfirmar={confirmarResetFabrica}
      />
      <ConfirmModal
        visivel={confirmExcluirSemestre !== null}
        titulo="Apagar esse semestre?"
        mensagem={
          confirmExcluirSemestre
            ? `${confirmExcluirSemestre.anoValor} · ${confirmExcluirSemestre.numero}º semestre, com ${confirmExcluirSemestre.materias} matéria${confirmExcluirSemestre.materias === 1 ? '' : 's'}. Não dá pra desfazer.`
            : undefined
        }
        textoConfirmar="Apagar"
        destrutivo
        aoConfirmar={confirmarExclusaoSemestre}
        aoCancelar={() => setConfirmExcluirSemestre(null)}
      />
      <ConfirmModal
        visivel={backupPendente !== null}
        titulo="Substituir seus dados?"
        mensagem={
          backupPendente
            ? `O arquivo tem ${descreverBackup(backupPendente)}. Tudo que está no app agora será apagado e trocado por isso.`
            : undefined
        }
        textoConfirmar="Substituir"
        destrutivo
        aoConfirmar={confirmarImportarBackup}
        aoCancelar={() => setBackupPendente(null)}
      />
      <ConfirmModal
        visivel={confirmTarefasConcluidas}
        titulo="Apagar tarefas concluídas?"
        mensagem={`${tarefasConcluidas} tarefa${tarefasConcluidas === 1 ? '' : 's'} concluída${tarefasConcluidas === 1 ? '' : 's'} ser${tarefasConcluidas === 1 ? 'á' : 'ão'} apagada${tarefasConcluidas === 1 ? '' : 's'}.`}
        textoConfirmar="Apagar"
        destrutivo
        aoConfirmar={confirmarApagarTarefasConcluidas}
        aoCancelar={() => setConfirmTarefasConcluidas(false)}
      />
    </SafeAreaView>
  );
}

function descreverBackup(backup: Backup): string {
  const r = resumirBackup(backup);
  return `${r.materias} matéria(s), ${r.avaliacoes} avaliação(ões), ${r.aulas} aula(s), ${r.compromissos} compromisso(s) e ${r.tarefas} tarefa(s)`;
}

function Linha({
  icone,
  texto,
  descricao,
  destrutivo,
  desabilitado,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  texto: string;
  descricao?: string;
  destrutivo?: boolean;
  desabilitado?: boolean;
  onPress: () => void;
}) {
  const cor = destrutivo ? colors.danger : colors.ink;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.linha,
        pressed && !desabilitado && styles.linhaPressed,
        desabilitado && styles.linhaDesabilitada,
      ]}
      onPress={onPress}
      disabled={desabilitado}
    >
      <View
        style={[
          styles.linhaIconeContainer,
          destrutivo && styles.linhaIconeContainerDestrutivo,
        ]}
      >
        <Ionicons name={icone} size={18} color={cor} />
      </View>
      <View style={styles.linhaTextos}>
        <Text style={[styles.linhaTexto, { color: cor }]}>{texto}</Text>
        {descricao && <Text style={styles.linhaDescricao}>{descricao}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 48,
    gap: spacing.xs,
  },
  tituloPagina: {
    fontFamily: font.display,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  cartaoResumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  resumoItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 2,
  },
  resumoNumero: {
    fontFamily: font.display,
    fontSize: 22,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  resumoRotulo: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grupo: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  linhaPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  linhaDesabilitada: {
    opacity: 0.45,
  },
  linhaIconeContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaIconeContainerDestrutivo: {
    backgroundColor: `${colors.danger}17`,
  },
  linhaTextos: {
    flex: 1,
    gap: 1,
  },
  linhaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 15,
  },
  linhaDescricao: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
  inputHora: {
    width: 72,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs + 2,
    fontFamily: font.bodyMedium,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  linhaSobre: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

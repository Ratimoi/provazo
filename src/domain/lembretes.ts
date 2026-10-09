import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { listAvaliacoesPendentes } from './avaliacoes';
import { calcularGatilhos } from './gatilhos';
import { horaLembrete, lembretesAtivos } from './preferencias';

const CANAL_ID = 'lembretes';

/** Mostra a notificação mesmo com o app aberto. Chamar uma vez no boot. */
export function configurarNotificacoes(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CANAL_ID, {
      name: 'Lembretes de provas e trabalhos',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {
      // canal é só refinamento (nome/importância); o padrão do sistema serve
    });
  }
}

export async function permissaoConcedida(): Promise<boolean> {
  const permissao = await Notifications.getPermissionsAsync();
  return permissao.granted;
}

/** Pede permissão (se ainda der) e diz se está concedida. */
export async function pedirPermissao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const nova = await Notifications.requestPermissionsAsync();
  return nova.granted;
}

function hojeIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

async function reagendar(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!lembretesAtivos() || !(await permissaoConcedida())) return;

  const avaliacoes = listAvaliacoesPendentes(hojeIso()).map((a) => ({
    id: a.id,
    titulo: a.titulo,
    tipo: a.tipo,
    data: a.data,
    hora: a.hora,
    materiaNome: a.materiaNome,
    diasAntesLembrete: a.diasAntesLembrete,
  }));

  for (const gatilho of calcularGatilhos(avaliacoes, horaLembrete(), new Date())) {
    await Notifications.scheduleNotificationAsync({
      identifier: gatilho.identificador,
      content: { title: gatilho.titulo, body: gatilho.corpo },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: gatilho.quando,
        channelId: CANAL_ID,
      },
    });
  }
}

let fila: Promise<void> = Promise.resolve();

/**
 * Cancela tudo e reagenda a partir do banco (idempotente, então não precisa
 * guardar id de notificação). Execuções são enfileiradas pra não se atropelarem.
 */
export function sincronizarLembretes(): Promise<void> {
  fila = fila.then(reagendar).catch(() => {
    // falha ao agendar não pode derrubar o app; a próxima sincronização tenta de novo
  });
  return fila;
}

/** Chamar ao salvar uma avaliação com aviso: pede a permissão na primeira vez
 * (no contexto em que a pessoa entende pra que serve) e já agenda. */
export async function garantirPermissaoDeLembretes(): Promise<void> {
  if (!lembretesAtivos()) return;
  if (await pedirPermissao()) await sincronizarLembretes();
}

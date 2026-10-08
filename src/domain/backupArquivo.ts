import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { gerarBackup } from './backup';
import { type Backup, validarBackup } from './backupFormato';

function dataParaNome(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Gera o arquivo de backup e abre o menu de compartilhamento (Drive, WhatsApp…). */
export async function exportarBackup(appVersion: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Esse aparelho não permite compartilhar arquivos.');
  }
  const arquivo = new File(Paths.cache, `provazo-backup-${dataParaNome()}.json`);
  arquivo.create({ overwrite: true });
  arquivo.write(JSON.stringify(gerarBackup(appVersion)));
  await Sharing.shareAsync(arquivo.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Salvar backup do Provazo',
  });
}

export type LeituraBackup =
  | { status: 'cancelado' }
  | { status: 'erro'; erro: string }
  | { status: 'ok'; backup: Backup };

/** Deixa a pessoa escolher um arquivo e valida o conteúdo, sem alterar nada. */
export async function lerArquivoDeBackup(): Promise<LeituraBackup> {
  const escolha = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });
  if (escolha.canceled) return { status: 'cancelado' };

  let conteudo: unknown;
  try {
    conteudo = JSON.parse(await new File(escolha.assets[0].uri).text());
  } catch {
    return { status: 'erro', erro: 'Não consegui ler esse arquivo como backup.' };
  }
  const validacao = validarBackup(conteudo);
  return validacao.ok
    ? { status: 'ok', backup: validacao.backup }
    : { status: 'erro', erro: validacao.erro };
}

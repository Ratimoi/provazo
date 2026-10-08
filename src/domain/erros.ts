/** Traduz erros do SQLite pra mensagens que fazem sentido pra quem usa o app. */
export function mensagemAmigavel(erro: unknown): string | undefined {
  if (!(erro instanceof Error)) return undefined;
  if (erro.message.includes('UNIQUE constraint failed')) {
    return erro.message.includes('materia')
      ? 'Essa matéria já existe nesse semestre.'
      : 'Essa aula já está cadastrada pra esse dia e horário.';
  }
  if (erro.message.includes('FOREIGN KEY constraint failed')) {
    return 'Algo que essa ação depende foi removido enquanto isso. Feche e abra a tela de novo.';
  }
  return erro.message;
}

export type GrupoPorInstituicao<T> = {
  /** null = matérias sem instituição. */
  instituicao: string | null;
  itens: T[];
};

/**
 * Agrupa por instituição (ordem alfabética); as sem instituição vão por último.
 * A ordem dos itens dentro de cada grupo é a da lista recebida.
 */
export function agruparPorInstituicao<T extends { instituicao: string | null }>(
  itens: T[],
): GrupoPorInstituicao<T>[] {
  const mapa = new Map<string | null, T[]>();
  for (const item of itens) {
    const chave = item.instituicao?.trim() ? item.instituicao.trim() : null;
    mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a.localeCompare(b, 'pt-BR');
    })
    .map(([instituicao, grupo]) => ({ instituicao, itens: grupo }));
}

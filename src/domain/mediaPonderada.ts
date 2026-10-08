export const ESCALA_MEDIA = 10;

/**
 * `somaNormalizada` = Σ(nota / notaMáxima × peso) e `somaPesos` = Σ(peso),
 * só das avaliações com nota lançada. Retorna a média na escala de 0 a 10,
 * ou null se a matéria ainda não tem nenhuma nota.
 */
export function mediaPonderada(
  somaNormalizada: number | null,
  somaPesos: number | null,
): number | null {
  if (!somaPesos || somaNormalizada == null) return null;
  return (somaNormalizada / somaPesos) * ESCALA_MEDIA;
}

import { useMemo, useState } from 'react';

import { getOrCreateAno } from '../domain/anos';
import { getOrCreateSemestre } from '../domain/semestres';
import {
  AnoNumero,
  semestreAdjacente,
  semestreAtualPadrao,
} from '../domain/semestreAtual';

export function useSemestreSelecionado() {
  const [selecionado, setSelecionado] = useState<AnoNumero>(() =>
    semestreAtualPadrao(),
  );

  const semestre = useMemo(() => {
    const ano = getOrCreateAno(selecionado.anoValor);
    return getOrCreateSemestre(ano.id, selecionado.numero);
  }, [selecionado.anoValor, selecionado.numero]);

  return {
    selecionado,
    semestre,
    irParaAnterior: () =>
      setSelecionado((atual) => semestreAdjacente(atual, -1)),
    irParaProximo: () =>
      setSelecionado((atual) => semestreAdjacente(atual, 1)),
  };
}

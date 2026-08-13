import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getOrCreateAno } from '../domain/anos';
import { getOrCreateSemestre, type Semestre } from '../domain/semestres';
import {
  AnoNumero,
  semestreAdjacente,
  semestreAtualPadrao,
} from '../domain/semestreAtual';

function carregarSemestre(selecionado: AnoNumero): Semestre {
  const ano = getOrCreateAno(selecionado.anoValor);
  return getOrCreateSemestre(ano.id, selecionado.numero);
}

export function useSemestreSelecionado() {
  const [selecionado, setSelecionado] = useState<AnoNumero>(() =>
    semestreAtualPadrao(),
  );
  const [semestre, setSemestre] = useState<Semestre>(() =>
    carregarSemestre(selecionado),
  );

  // Recarrega sempre que a tela ganha foco, não só quando o ano/semestre
  // selecionado muda — como as abas do expo-router ficam montadas em
  // segundo plano, sem isso um reset feito na aba Configurações deixava
  // essa tela com um semestre "fantasma" (id que não existe mais), e criar
  // uma matéria falhava com FOREIGN KEY constraint failed.
  useFocusEffect(
    useCallback(() => {
      setSemestre(carregarSemestre(selecionado));
    }, [selecionado]),
  );

  return {
    selecionado,
    semestre,
    irParaAnterior: () =>
      setSelecionado((atual) => semestreAdjacente(atual, -1)),
    irParaProximo: () =>
      setSelecionado((atual) => semestreAdjacente(atual, 1)),
  };
}

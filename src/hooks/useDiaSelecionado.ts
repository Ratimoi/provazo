import { useCallback, useState } from 'react';

import { formatarIso } from '../domain/periodo';

export function useDiaSelecionado() {
  const [dataIso, setDataIso] = useState(() => formatarIso(new Date()));
  const hoje = formatarIso(new Date());

  return {
    dataIso,
    hoje,
    ehHoje: dataIso === hoje,
    irParaData: useCallback((iso: string) => setDataIso(iso), []),
    irParaHoje: useCallback(() => setDataIso(formatarIso(new Date())), []),
  };
}

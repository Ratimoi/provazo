import { addDays, format } from 'date-fns';
import { useMemo, useState } from 'react';

export function useDiaSelecionado() {
  const [data, setData] = useState(() => new Date());

  const dataIso = useMemo(() => format(data, 'yyyy-MM-dd'), [data]);

  return {
    data,
    dataIso,
    ehHoje: dataIso === format(new Date(), 'yyyy-MM-dd'),
    irParaAnterior: () => setData((atual) => addDays(atual, -1)),
    irParaProximo: () => setData((atual) => addDays(atual, 1)),
    irParaHoje: () => setData(new Date()),
  };
}

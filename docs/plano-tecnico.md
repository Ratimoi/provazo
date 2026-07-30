# Plano técnico — App de provas, trabalhos e timeline diária

## 1. Visão geral

Duas abas principais:

1. **Provas e Trabalhos** — CRUD de avaliações vinculadas a matéria, semestre, ano, data, hora e peso, com cálculo automático de médias.
2. **Timeline** — tira horizontal representando as 24h do dia atual, com blocos coloridos por tipo de compromisso (aula recorrente, prova, trabalho, evento pessoal), navegável entre dias.

Decisões já fechadas na conversa:
- **Stack**: React Native (Expo), aproveitando seu conhecimento de TS/React.
- **Persistência**: 100% local, offline-first (SQLite no dispositivo).
- **Timeline**: dia único por vez, com navegação (setas ou swipe) entre dias, blocos posicionados proporcionalmente ao horário real (não uma "grade de horas" com blocos de tamanho fixo).
- **Cálculo de notas**: o app calcula médias ponderadas automaticamente a partir do peso.
- **Eventos recorrentes**: suportados (aulas semanais, aniversários anuais, etc.), aparecem tanto na timeline quanto opcionalmente numa lista.

## 2. Stack técnica

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Expo (React Native + TypeScript) | Reaproveita seu domínio de React/TS, build gerenciado, fácil gerar APK |
| Banco local | `expo-sqlite` + Drizzle ORM (ou Prisma via `@prisma/adapter-libsql`, mas Drizzle tem melhor suporte a SQLite embarcado) | Você já conhece ORM (Prisma); Drizzle é o equivalente leve para SQLite local |
| Navegação | `expo-router` ou `react-navigation` (bottom tabs) | Abas nativas para "Provas/Trabalhos" e "Timeline" |
| Estado | React Query (para cache de queries locais) + Context/Zustand para estado de UI | Evita prop drilling, familiar vindo do ecossistema React |
| Notificações | `expo-notifications` | Lembretes de provas/entregas próximas |
| Datas | `date-fns` | Cálculo de recorrência, formatação, diffs |

## 3. Modelo de dados (normalizado)

O modelo abaixo corrige a versão anterior: campos que eram objetos/arrays embutidos (`padraoRecorrencia`, `excecoes`) viraram tabelas próprias, já que SQLite não tem tipo array estruturado — mantê-los embutidos violaria 1ª forma normal e dificultaria consultas. Cor também deixou de ser duplicada em toda tabela: só `materia` e `evento_unico` guardam `cor_hex` diretamente; um evento recorrente do tipo "aula" herda a cor da matéria.

```sql
CREATE TABLE ano (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor INTEGER NOT NULL UNIQUE
);

CREATE TABLE semestre (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ano_id INTEGER NOT NULL REFERENCES ano(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL CHECK (numero IN (1, 2)),
  UNIQUE (ano_id, numero)
);

CREATE TABLE materia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semestre_id INTEGER NOT NULL REFERENCES semestre(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor_hex TEXT NOT NULL,
  UNIQUE (semestre_id, nome)
);

CREATE TABLE avaliacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materia_id INTEGER NOT NULL REFERENCES materia(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('prova', 'trabalho')),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  peso REAL NOT NULL,
  nota REAL,
  nota_maxima REAL NOT NULL DEFAULT 10,
  dias_antes_lembrete INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_avaliacao_data ON avaliacao(data);

-- Aulas, aniversários e outros eventos que se repetem
CREATE TABLE evento_recorrente (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aula', 'aniversario', 'outro')),
  materia_id INTEGER REFERENCES materia(id) ON DELETE CASCADE,
  cor_hex TEXT,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('semanal', 'anual')),
  data_base DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  -- consistência: 'aula' sempre tem materia_id e herda a cor dela;
  -- os demais tipos não têm materia_id e precisam do próprio cor_hex
  CHECK (
    (tipo = 'aula' AND materia_id IS NOT NULL AND cor_hex IS NULL)
    OR (tipo != 'aula' AND materia_id IS NULL AND cor_hex IS NOT NULL)
  )
);

-- Dias da semana em que um evento 'semanal' ocorre (many-to-many simplificado)
CREATE TABLE evento_recorrente_dia_semana (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_recorrente_id INTEGER NOT NULL REFERENCES evento_recorrente(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0 = domingo
  UNIQUE (evento_recorrente_id, dia_semana)
);

-- Datas em que um evento recorrente específico não deve aparecer (feriado, aula cancelada)
CREATE TABLE evento_recorrente_excecao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_recorrente_id INTEGER NOT NULL REFERENCES evento_recorrente(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  UNIQUE (evento_recorrente_id, data)
);

-- Compromissos pontuais sem vínculo com matéria (ex: reunião, consulta)
CREATE TABLE evento_unico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  cor_hex TEXT NOT NULL
);
CREATE INDEX idx_evento_unico_data ON evento_unico(data);
```

**Cálculo de médias**: para cada `materia`, média ponderada = `Σ(nota × peso) / Σ(peso)` sobre as linhas de `avaliacao` com `nota IS NOT NULL`. É uma query agregada (`GROUP BY materia_id`), não precisa de coluna calculada armazenada.

**Como a timeline busca os eventos de um dia** (ver seção 5 para a lógica completa):
1. `SELECT * FROM avaliacao WHERE data = :dia`
2. `SELECT * FROM evento_unico WHERE data = :dia`
3. Para `evento_recorrente`: filtra por `frequencia = 'semanal'` cujo `dia_semana` (via join com `evento_recorrente_dia_semana`) bate com o dia da semana de `:dia`, ou `frequencia = 'anual'` cujo mês/dia de `data_base` bate com `:dia` — excluindo qualquer linha presente em `evento_recorrente_excecao` para aquela data

## 4. Telas

### Aba "Provas e Trabalhos"
- Lista agrupada por matéria (ou por data, com toggle)
- Filtro por semestre/ano
- Card de cada avaliação: matéria, tipo, data, peso, nota (se houver)
- Tela de detalhe/edição: formulário com todos os campos
- Card de resumo no topo: média atual por matéria/semestre

### Aba "Timeline"
- Header com data atual + setas de navegação (ou swipe horizontal entre dias)
- Tira de 24h com blocos posicionados proporcionalmente ao horário (como no mockup que te mostrei)
- Cores por tipo: aula = azul, prova = vermelho, trabalho = âmbar, evento pessoal = roxo/cinza (definir legenda fixa ou permitir customizar cor por matéria)
- Toque no bloco abre detalhe do compromisso
- Lista abaixo da timeline com os itens do dia em ordem cronológica

### Tela extra sugerida: "Resumo/Dashboard"
- Próximas provas/entregas (7 dias)
- Médias por matéria do semestre atual
- Não é obrigatória no MVP, mas é barata de fazer já que os dados existem

## 5. Recorrência — como vou implementar

Modelo simplificado (não um RRULE completo, que seria overkill), já refletido nas tabelas da seção 3:
- **Semanal**: `evento_recorrente_dia_semana` guarda 1 ou mais dias da semana por evento (ex: aula de Cálculo 2 toda segunda e quarta = duas linhas)
- **Anual**: usa só o mês/dia de `data_base` (aniversários)
- **Exceções**: `evento_recorrente_excecao` guarda datas pontuais em que o evento recorrente não deve aparecer (ex: feriado, aula cancelada)

Ao renderizar a timeline de um dia específico, o app roda as 3 queries descritas no fim da seção 3, junta os resultados e ordena por horário.

## 6. Roadmap sugerido

**Fase 1 — MVP**
- Setup do projeto Expo + navegação em abas
- Modelo de dados + Drizzle/SQLite configurado
- CRUD de Ano/Semestre/Matéria
- CRUD de Avaliacao (prova/trabalho)
- Lista da aba "Provas e Trabalhos" com filtro por semestre

**Fase 2 — Timeline**
- Componente da tira de 24h com posicionamento proporcional
- Navegação entre dias
- Integração com Avaliacao + EventoUnico

**Fase 3 — Recorrência**
- CRUD de EventoRecorrente (aulas, aniversários)
- Lógica de expansão de recorrência + exceções
- Exibição na timeline

**Fase 4 — Cálculos e polimento**
- Médias ponderadas por matéria/semestre
- Tela de resumo/dashboard
- Notificações locais (lembrete de prova X dias antes)
- Refinamento visual, cores customizáveis por matéria

## 7. Decisões de default (ajustáveis depois)

Pra não travar o início do desenvolvimento, assumi os seguintes defaults. São fáceis de mudar depois, mas dão ao Claude Code algo concreto pra implementar em vez de um "a definir":

- **Notificações**: lembrete padrão de 1 dia antes da avaliação, configurável por avaliação individual (campo `diasAntesLembrete`, default 1, editável no formulário).
- **Cores**: paleta fixa de 8-10 cores pré-definidas (reaproveitando a paleta usada no mockup: azul, vermelho, âmbar, roxo, verde, etc.), atribuída automaticamente por ordem de criação da matéria, com opção de trocar manualmente no formulário de matéria.
- **Backup**: incluído na Fase 4 — export/import de um arquivo JSON com todo o banco local, acessível pela tela de configurações. Cobre o cenário de troca de aparelho sem precisar de backend.

## 8. Estrutura inicial de pastas (para o Claude Code)

```
app/
  (tabs)/
    provas-trabalhos/
      index.tsx
      [id].tsx        # detalhe/edição
    timeline/
      index.tsx
  _layout.tsx
src/
  db/
    schema.ts          # tabelas Drizzle
    client.ts           # conexão SQLite
    migrations/
  domain/
    materias.ts         # queries/mutations de Materia
    avaliacoes.ts
    eventosRecorrentes.ts
    eventosUnicos.ts
    medias.ts            # cálculo de médias ponderadas
    recorrencia.ts        # expansão de EventoRecorrente para um dia específico
  components/
    timeline/
      TimelineStrip.tsx
      TimelineBlock.tsx
    avaliacoes/
      AvaliacaoCard.tsx
      AvaliacaoForm.tsx
  hooks/
    useAvaliacoesDoDia.ts
    useMediasPorMateria.ts
```

## 9. Comandos de setup

```bash
npx create-expo-app@latest provazo -t
cd provazo
npx expo install expo-sqlite expo-notifications expo-router
npm install drizzle-orm date-fns zustand @tanstack/react-query
npm install -D drizzle-kit
```

## 10. Critérios de aceite do MVP (Fase 1 + 2)

- [ ] É possível criar Ano → Semestre → Matéria e ver a hierarquia refletida nos filtros
- [ ] É possível criar uma Avaliação (prova/trabalho) com data, hora, peso e nota opcional
- [ ] A lista de "Provas e Trabalhos" filtra corretamente por semestre/ano
- [ ] A aba Timeline mostra os blocos do dia atual posicionados proporcionalmente ao horário
- [ ] É possível navegar entre dias na Timeline (anterior/próximo)
- [ ] Tocar num bloco da Timeline abre o detalhe do compromisso correspondente
- [ ] Os dados persistem localmente entre reinicializações do app (sem depender de rede)
